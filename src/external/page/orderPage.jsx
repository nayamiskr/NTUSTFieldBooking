import { useState, useEffect } from "react";
import api from "../../baseApi"
import Navbar from "../components/navbar";
import Loading from "../../components/loading";
import { bookingService } from "../../service/bookingService";
import { pickUpService } from "../../service/pickUpService";
import { statusMap } from "../../constant/statusMap";
import { formatDateTime } from "../../components/dateTimeFormat";

function OrderPage() {
    const [orders, setOrders] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("pickup");
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedCancelOrder, setSelectedCancelOrder] = useState(null);
    const [cancellingIds, setCancellingIds] = useState(() => new Set());
    const [cancelActionError, setCancelActionError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            const userId = JSON.parse(localStorage.getItem("userId"));
            const query = {
                user_id: userId,
            }
            try {
                const bookingRes = await bookingService.getBookingList(query);
                const pickUpRes = await pickUpService.getMyPickUpList(true);
                setOrders({ booking: bookingRes, pickUp: pickUpRes });
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, []);

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

    return (
        <div>
            <Navbar />
            <Loading isLoading={loading} text="取得訂單資料中..." />
            {error && <p>取得訂單資料失敗: {error.message}</p>}
            {cancelActionError && <p className="text-red-600 text-center mt-2">取消申請失敗: {cancelActionError.message}</p>}
            {!loading && orders &&
                (
                    <div>
                        <h1 class="text-3xl font-bold text-center my-8">我的預約</h1>

                        {/* Tab Buttons */}
                        <div className="flex justify-center w-full mb-6">
                            <div className="inline-flex bg-blue-50 p-1 rounded-lg shadow-inner">
                                <button
                                    className={`w-32 py-2 text-center rounded-md transition-all duration-200 text-ellipsis font-bold ${activeTab === "pickup"
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                        }`}
                                    onClick={() => setActiveTab("pickup")}
                                >
                                    臨打團
                                </button>

                                <button
                                    className={`w-32 py-2 text-center rounded-md transition-all duration-200 text-ellipsis font-bold ${activeTab === "booking"
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                        }`}
                                    onClick={() => setActiveTab("booking")}
                                >
                                    場地預約
                                </button>
                            </div>
                        </div>

                        {/* Order List */}
                        <ul>
                            {(activeTab === "booking" ? orders.booking?.items : orders.pickUp)?.map((order, index) => (
                                <li key={order.id} className={`w-[95%] md:w-[80%] mx-auto mb-4 p-5 border border-gray-200 rounded-xl shadow-sm bg-white ${order.status === "cancelled" ? "opacity-40" : ""}`}>

                                    {/* 標題與狀態 */}
                                    <div className="flex justify-between items-start mb-3 gap-3">
                                        <h2 className="text-xl font-bold text-gray-900 break-words">
                                            {activeTab === "booking"
                                                ? `${order.location?.name} ${order.resource ? `- ${order.resource.name}` : ""}`
                                                : `${order.title}`}
                                        </h2>
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

                                    {/* 按鈕區塊 */}
                                    <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                                        {!cancellingIds.has(order.id) && (order.status !== "cancelled" && order.status !== "cancel_request") && !order._cancelRequested && (
                                            <button
                                                className="w-full sm:w-auto border border-red-500 text-red-600 bg-white hover:bg-red-50 text-sm font-semibold py-2 px-6 rounded-lg transition"
                                                onClick={() => openCancelModal(order)}
                                            >
                                                取消預約
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
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
        </div>
    )
}

export default OrderPage;