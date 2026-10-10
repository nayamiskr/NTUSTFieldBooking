import { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import Loading from "../../components/loading";
import { bookingService } from "../../service/bookingService";
import { pickUpService } from "../../service/pickUpService";
import { statusMap } from "../../constant/statusMap";
import { formatDateTime } from "../../utils/dateTimeFormat";
import { sportIconMap, functionIconMap } from "../../constant/IconMap";
import { zhTWDictionary } from "../../locale/zh-TW/translate";
import { MapPinned } from "lucide-react";
import PickUpDetailPopUp from "../components/pickUp/pickUpDetailPopUp";
import { isRegistrationClosed } from "../pickUpTiming";
import { getHistoricalOrders, isOrderExpired, sortOrdersForDisplay } from "../orderDisplay";

const STARTING_SOON_WINDOW_MS = 24 * 60 * 60 * 1000;

const getDirectionsUrl = (location) => {
    const latitude = Number(location?.latitude);
    const longitude = Number(location?.longitude);
    const hasCoordinates = location?.latitude !== null && location?.latitude !== undefined && location?.latitude !== ""
        && location?.longitude !== null && location?.longitude !== undefined && location?.longitude !== ""
        && Number.isFinite(latitude) && Number.isFinite(longitude)
        && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180
        && (latitude !== 0 || longitude !== 0);
    const address = typeof location?.address === "string" ? location.address.trim() : "";
    const name = typeof location?.name === "string" ? location.name.trim() : "";
    const destination = hasCoordinates ? `${latitude},${longitude}` : (address || name);
    return destination
        ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving&dir_action=navigate`
        : null;
};

const isStartingSoon = (order, now) => {
    if (["cancelled", "cancel_request", "rejected"].includes(order.status)) return false;
    const startTime = new Date(order.start_time).getTime();
    const timeUntilStart = startTime - now;
    return Number.isFinite(startTime) && timeUntilStart > 0 && timeUntilStart <= STARTING_SOON_WINDOW_MS;
};

const resourceSportCodes = {
    baseball: "BASEBALL",
    volleyball: "VOLLEYBALL",
    badminton: "BADMINTON",
    tennis: "TENNIS",
    football: "SOCCER",
    soccer: "SOCCER",
    basketball: "BASKETBALL",
};

function OrderSportTag({ order }) {
    const sport = order.sport;
    const resourceType = order.resource?.resource_type?.toLowerCase();
    const code = (typeof sport === "string" ? sport : sport?.code) || resourceSportCodes[resourceType];
    const name = (typeof sport === "object" ? sport?.name : null) || sportIconMap[code]?.name;
    if (!name) return null;

    return (
        <span className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-sm font-normal text-gray-600">
            {sportIconMap[code]?.icon}
            {name}
        </span>
    );
}

export default function OrderPage({ historyOnly = false }) {
    const [orders, setOrders] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(historyOnly ? "history" : "pickup");
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedCancelOrder, setSelectedCancelOrder] = useState(null);
    const [cancellingIds, setCancellingIds] = useState(() => new Set());
    const [cancelActionError, setCancelActionError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [now, setNow] = useState(() => Date.now());
    const [selectedPickUpGroup, setSelectedPickUpGroup] = useState(null);

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 60 * 1000);
        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        setLoading(true);
        const fetchOrder = async () => {
            const userId = JSON.parse(localStorage.getItem("userId"));
            const query = {
                user_id: userId,
            }
            try {
                const bookingRes = await bookingService.getBookingList(query, true);
                const pickUpRes = await pickUpService.getMyPickUpList(true);
                setOrders({ booking: bookingRes, pickUp: pickUpRes });
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [refreshTrigger]);

    const openCancelModal = (order) => {
        setCancelActionError(null);
        setSelectedCancelOrder({
            id: order.id,
            ordereName: activeTab === "booking" ? order.location.name + " - " + (order?.resource?.name ?? "") : order.title,
            start: order?.start_time,
            end: order?.end_time,
        });
        setCancelModalOpen(true);
    };

    const openPickUpDetail = (order) => {
        if (!order.pickupGroup) return;
        setSelectedPickUpGroup({ ...order.pickupGroup, enrolledStatus: order.status || "pending" });
    };

    const handleContactHost = (host) => {
        const contactUrl = host.contact_url || host.line_url || host.lineUrl;
        if (contactUrl) {
            window.open(contactUrl, "_blank", "noopener,noreferrer");
        } else if (host.email) {
            window.location.href = `mailto:${host.email}`;
        } else if (host.phone) {
            window.location.href = `tel:${host.phone}`;
        }
    };

    const confirmCancel = async () => {
        if (!selectedCancelOrder?.id) return;
        const orderId = selectedCancelOrder.id;

        setCancellingIds((prev) => {
            const next = new Set(prev);
            next.add(orderId);
            return next;
        });

        try {
            if (activeTab === "pickup") {
                await pickUpService.cancelPickUpOrder(orderId);
            } else {
            }

            setOrders((prev) => {
                if (activeTab === "booking") {
                    return {
                        ...prev,
                        booking: {
                            ...prev.booking,
                            items: prev.booking.items.map(o => o.id === orderId ? { ...o, status: "cancel_request" } : o)
                        }
                    };
                } else {
                    return {
                        ...prev,
                        pickUp: prev.pickUp.map(o => o.id === orderId ? { ...o, status: "cancel_request" } : o)
                    };
                }
            });

            // 順便把 loading 狀態解掉
            setCancellingIds((prev) => {
                const next = new Set(prev);
                next.delete(orderId);
                return next;
            });
            setCancelModalOpen(false);
            setSelectedCancelOrder(null);
        } catch (err) {
            setCancellingIds((prev) => {
                const next = new Set(prev);
                next.delete(orderId);
                return next;
            });
            setCancelActionError(err);
        }
    };

    const bookingOrders = orders?.booking?.items || [];
    const pickupOrders = orders?.pickUp || [];
    const visibleOrders = activeTab === "history"
        ? getHistoricalOrders(bookingOrders, pickupOrders, now)
        : sortOrdersForDisplay(
            (activeTab === "booking" ? bookingOrders : pickupOrders)
                .filter((order) => !isOrderExpired(order, now)), now
        );

    return (
        <div>
            <Navbar />
            <Loading isLoading={loading} text="取得訂單資料中..." />
            {error && <p>取得訂單資料失敗: {error.message}</p>}
            {cancelActionError && <p className="text-red-600 text-center mt-2">取消申請失敗: {cancelActionError.message}</p>}
            {!loading && orders &&
                (
                    <div>
                        <h1 className="text-3xl font-bold text-center my-8">{historyOnly ? "歷史預約" : "我的預約"}</h1>

                        {/* Tab Buttons */}
                        {!historyOnly && <div className="flex justify-center w-full mb-6">
                            <div className="inline-flex max-w-[95%] bg-blue-50 p-1 rounded-lg shadow-inner">
                                <button
                                    className={`w-24 sm:w-32 py-2 text-center rounded-md transition-all duration-200 text-sm sm:text-base font-bold ${activeTab === "pickup"
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                        }`}
                                    onClick={() => setActiveTab("pickup")}
                                >
                                    臨打團
                                </button>

                                <button
                                    className={`w-24 sm:w-32 py-2 text-center rounded-md transition-all duration-200 text-sm sm:text-base font-bold ${activeTab === "booking"
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                        }`}
                                    onClick={() => setActiveTab("booking")}
                                >
                                    場地預約
                                </button>

                            </div>
                        </div>}

                        {/* Order List */}
                        {visibleOrders.length === 0 && (
                            <p className="mx-auto w-[95%] rounded-xl border border-gray-200 bg-white px-5 py-10 text-center text-gray-500 md:w-[50%]">
                                {activeTab === "history" ? "目前沒有歷史預約" : "目前沒有進行中或即將開始的預約"}
                            </p>
                        )}
                        <ul>
                            {visibleOrders.map((order) => {
                                const directionsUrl = getDirectionsUrl(order.location);
                                const isPickupOrder = activeTab === "pickup" || (activeTab === "history" && order.orderKind === "pickup");
                                const startingSoon = activeTab !== "history" && isStartingSoon(order, now);
                                return (
                                    <li
                                        key={`${order.orderKind || activeTab}-${order.id}`}
                                        onClick={isPickupOrder ? () => openPickUpDetail(order) : undefined}
                                        className={`w-[95%] md:w-[50%] mx-auto mb-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-colors ${isPickupOrder ? "cursor-pointer hover:border-blue-300 hover:bg-blue-50/50" : ""} ${order.status === "cancelled" ? "opacity-40" : ""}`}
                                    >

                                    {/* 點擊臨打訂單摘要可查看所報名的活動 */}
                                    <div
                                        role={isPickupOrder ? "button" : undefined}
                                        tabIndex={isPickupOrder ? 0 : undefined}
                                        aria-label={isPickupOrder ? `查看${order.title}臨打團詳細資訊` : undefined}
                                        onKeyDown={isPickupOrder ? (event) => {
                                            if (event.key === "Enter" || event.key === " ") {
                                                event.preventDefault();
                                                openPickUpDetail(order);
                                            }
                                        } : undefined}
                                        className={isPickupOrder ? "cursor-pointer rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-500" : ""}
                                    >
                                    <div className="flex justify-between items-start mb-3 gap-3">
                                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                                            <h2 className="text-xl font-bold text-gray-900 break-words">
                                                {!isPickupOrder
                                                    ? `${order.location?.name} ${order.resource ? `- ${order.resource.name}` : ""}`
                                                    : `${order.title}`}
                                            </h2>
                                            {activeTab === "history" && <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">{isPickupOrder ? "臨打團" : "場地預約"}</span>}
                                            <OrderSportTag order={order} />
                                            {startingSoon && (
                                                <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">即將開始 · 24 小時內</span>
                                            )}
                                        </div>
                                        <div className={`shrink-0 px-3 py-1 rounded-md font-bold text-white font-medium ${statusMap[order.status]?.class || ""}`}>
                                            {statusMap[order.status]?.label || order.status}
                                        </div>
                                    </div>

                                    {/* 詳細資訊 */}
                                    <div className="text-sm text-gray-600 mb-4">
                                        <p>日期：{formatDateTime(order.start_time).date}</p>
                                        <p>時間：{formatDateTime(order.start_time).time} - {formatDateTime(order.end_time).time}</p>
                                        <p>地點：{order.location?.name || "未指定"}</p>
                                    </div>
                                    {isPickupOrder && <p className="mb-3 text-sm font-semibold text-blue-600">點擊查看臨打團詳細資訊 →</p>}
                                    </div>

                                    {/* 按鈕區塊 */}
                                    <div className="flex flex-wrap justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                                        {directionsUrl && (
                                            <a href={directionsUrl} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 sm:w-auto">
                                                <MapPinned size={16} aria-hidden="true" />Google Maps 導航
                                            </a>
                                        )}
                                        {activeTab !== "history" && !cancellingIds.has(order.id) && (order.status !== "cancelled" && order.status !== "cancel_request") && !order._cancelRequested && (
                                            <button
                                                className="w-full sm:w-auto border border-red-500 text-red-600 bg-white hover:bg-red-50 text-sm font-semibold py-2 px-6 rounded-lg transition"
                                                onClick={(event) => { event.stopPropagation(); openCancelModal(order); }}
                                            >
                                                取消預約
                                            </button>
                                        )}
                                    </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            {/* {確認要刪除彈窗} */}
            {cancelModalOpen && (
                <div className="fixed inset-0 z-9999 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setCancelModalOpen(false)} />

                    <div className="relative w-[92%] max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <h2 className="text-xl font-bold text-gray-900">確認取消預約？</h2>
                        <p className="mt-2 text-gray-600">
                            你確定要取消「{selectedCancelOrder?.ordereName || ""}」這筆預約嗎？
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            <p>日期：{formatDateTime(selectedCancelOrder.start).date}</p>
                            <p>時間：{formatDateTime(selectedCancelOrder.start).time} - {formatDateTime(selectedCancelOrder.end).time}</p>
                        </p>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                className="flex-1 rounded-lg border border-gray-300 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                                onClick={() => setCancelModalOpen(false)}
                            >
                                先不要
                            </button>
                            <button
                                type="button"
                                className="flex-1 rounded-lg bg-red-600 py-2 font-semibold text-white hover:bg-red-700"
                                onClick={confirmCancel}
                            >
                                確認取消
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {selectedPickUpGroup && <div
                role="presentation"
                className="fixed inset-0 z-[60] flex items-end bg-black/45 p-0 sm:items-center sm:justify-center sm:p-6"
                onMouseDown={() => setSelectedPickUpGroup(null)}
            >
                <PickUpDetailPopUp
                    selectedGroup={selectedPickUpGroup}
                    closeDetailModal={() => setSelectedPickUpGroup(null)}
                    onContactHost={handleContactHost}
                    registrationClosed={isRegistrationClosed(selectedPickUpGroup, now)}
                    hideJoin
                />
            </div>}
            {/* 重新載入按鈕 */}
            <button
                onClick={() => setRefreshTrigger(prev => prev + 1)}
                className="fixed bottom-4 right-4 z-50 flex items-center justify-center gap-2 bg-gray-700 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            >
                <div>{functionIconMap.refresh.icon}</div>
                <span className="font-bold tracking-wider">{zhTWDictionary.pickUpPage.button.refresh}</span>
            </button>
        </div>
    )
}
