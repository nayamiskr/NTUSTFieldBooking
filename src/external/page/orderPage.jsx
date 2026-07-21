import { useState, useEffect } from "react";
import api from "../../baseApi"
import Navbar from "../components/navbar";
import Loading from "../../components/loading";
import { bookingService } from "../../service/bookingService";
import { pickUpService } from "../../service/pickUpService";
import { statusMap } from "../../constant/statusMap";

function OrderPage() {
    const [orders, setOrders] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("booking");
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
            resourceName: order.location.name + " - " + (order?.resource?.name ?? ""),
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

    const statusPriority = {
        pending: 0,
        confirmed: 1,
        completed: 2,
        cancel_requested: 3,
        cancelled: 4,
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
                                    className={`w-32 py-2 text-center rounded-md transition-all duration-200 text-ellipsis font-bold ${activeTab === "booking"
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                        }`}
                                    onClick={() => setActiveTab("booking")}
                                >
                                    場地預約
                                </button>

                                <button
                                    className={`w-32 py-2 text-center rounded-md transition-all duration-200 text-ellipsis font-bold ${activeTab === "pickup"
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                        }`}
                                    onClick={() => setActiveTab("pickup")}
                                >
                                    臨打團
                                </button>
                            </div>
                        </div>

                        {/* Order List */}
                        <ul>
                            {(activeTab === "booking" ? orders.booking?.items : orders.pickUp)?.map((order, index) => (
                                <li key={order.id} className={`flex flex-row justify-between w-full md:w-[60%] h-[130px] mx-auto my-3 border border-blue-200 rounded-md ${order.status === "cancelled" ? "opacity-40" : ""}`}>
                                    <div className="flex flex-col justify-between p-4">
                                        <div className="flex flex-row items-center gap-2">
                                            <p className="text-lg font-semibold">
                                                {activeTab === "booking"
                                                    ? `${order.location?.name} ${order.resource ? `- ${order.resource.name}` : ""}`
                                                    : `${order.title}`}
                                            </p>
                                        </div>
                                        <p className="text-start text-md text-gray-400">預約時間：{order.start_time ? new Date(order.start_time).toLocaleDateString("zh-TW") : ""} {order.start_time ? " " : ""}{order.start_time ? `${new Date(order.start_time).toLocaleTimeString("zh-TW", { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date(order.end_time).toLocaleTimeString("zh-TW", { hour: '2-digit', minute: '2-digit', hour12: false })}` : ""}</p>
                                    </div>

                                    <div className=" flex flex-col h-auto items-end justify-between p-4">
                                        <p className="text-md font-semibold" >
                                            <span className={statusMap[order.status]?.class + " px-2 py-1 rounded-md ml-2 font-normal"}>
                                                {statusMap[order.status]?.label || order.status}
                                            </span>
                                        </p>
                                        {!cancellingIds.has(order.id) && order.status !== "cancelled" && !order._cancelRequested && (
                                            <button
                                                className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 px-4 rounded-md"
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
                            你確定要取消「{selectedCancelOrder?.resourceName || ""}」這筆預約嗎？
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            {selectedCancelOrder?.start ? new Date(selectedCancelOrder.start).toLocaleDateString("zh-TW") : ""}
                            {selectedCancelOrder?.start ? " " : ""}
                            {selectedCancelOrder?.start
                                ? `${new Date(selectedCancelOrder.start).toLocaleTimeString("zh-TW", { hour: '2-digit', minute: '2-digit' })} - ${new Date(selectedCancelOrder.end).toLocaleTimeString("zh-TW", { hour: '2-digit', minute: '2-digit' })}`
                                : ""}
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