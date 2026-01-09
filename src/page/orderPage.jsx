import { useState, useEffect } from "react";
import api from "../baseApi"
import Navbar from "../components/navbar";

function OrderPage() {
    const [orders, setOrders] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get("/bookings");
                setOrders(res.data);
            } 
            catch (err) { setError(err); } 
            finally { setLoading(false); }
        };
        fetchData();
    }, []);
    return (
        <div>
            <Navbar/>
            {loading && <p>取得訂單資料中...</p>}
            {error && <p>取得訂單資料失敗: {error.message}</p>}
            {!loading && orders &&
            (
                <div>
                    <h1 class="text-3xl font-bold text-center my-8">我的預約</h1>
                    <ul>
                        {orders.items.map((order) => (
                            <li key={order.id} class="relative w-[80%] h-[130px] mx-auto border border-blue-200 rounded-md">
                                <p class="absolute top-3 left-6 text-2xl font-bold">場地: {order.resource.name}</p>
                                <p class="absolute bottom-10 left-6 text-lg text-gray-400">日期：{new Date(order.start_time).toLocaleDateString("zh-TW")} {" "}</p>
                                <p class="absolute bottom-3 left-6 text-lg text-gray-400">時間：{new Date(order.start_time).toLocaleTimeString("zh-TW", { hour: '2-digit', minute: '2-digit' })} - {new Date(order.end_time).toLocaleTimeString("zh-TW", { hour: '2-digit', minute: '2-digit' })}</p>
                                <p class="absolute top-3 right-6 text-lg">狀態: {order.status}</p>
                                <p class="absolute bottom-3 right-6 text-red-500 text-lg">取消訂單</p>

                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

export default OrderPage;