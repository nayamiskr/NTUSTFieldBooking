import Navbar from "../components/navbar";
import Calendar from "../../components/dayPick";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import FieldPicker from "../components/fieldPicker";
import api from "../../baseApi"
import Loading from "../../components/loading";
import { IoMdPeople } from "react-icons/io";
import { FaClock } from "react-icons/fa6";
import { FaMapPin } from "react-icons/fa";
import { GrStatusInfo } from "react-icons/gr";
import { FaArrowLeft } from "react-icons/fa";
import SelectFieldSection from "../components/SelectFieldSection";

function Bookpage() {
    const { id } = useParams();
    const imgUrl = '/field_img/';
    const [activeTab, setActiveTab] = useState("info");
    const [isOpen, setIsOpen] = useState(true);
    const [fieldInfo, setFieldInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedSlots, setSelectedSlots] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const OPEN_HOUR = 8;
    const CLOSE_HOUR = 22;
    const HOURS = Array.from({ length: CLOSE_HOUR - OPEN_HOUR }, (_, i) => OPEN_HOUR + i);
    const hasData = !!fieldInfo;
    const baseDate = selectedDate ? new Date(selectedDate) : new Date();
    const sevenDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(baseDate);
        d.setDate(baseDate.getDate() + i - 3);
        return d;
    });

    const formatDate = (d) => {
        const m = d.getMonth() + 1;
        const day = d.getDate();
        const week = ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
        return `${m}/${day} (${week})`;
    };

    useEffect(() => {
        let isMounted = true;

        const fetchLocation = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/locations/${id}`);

                if (isMounted) {
                    setFieldInfo(res.data);
                    console.log("location data:", res.data);
                }
            } catch (err) {
                console.error("fail fetch location", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (id) fetchLocation();

        return () => {
            isMounted = false;
        };
    }, [id]);

    const isContiguous = (hours) => {
        if (!hours || hours.length <= 1) return true;
        const sortedHours = [...hours].sort((a, b) => a - b);
        for (let i = 1; i < sortedHours.length; i++) {
            if (sortedHours[i] !== sortedHours[i - 1] + 1) return false;
        }
        return true;
    };

    const handleSelectSlot = ({ fieldIdx, resourceIdx, hour, date }) => {
        const dateKey = date ? new Date(date).toISOString().slice(0, 10) : null;
        setSelectedSlots((prev) => {

            if (!prev) {
                return { fieldIdx, resourceIdx, hours: [hour], date: dateKey };
            }

            const sameCourt = prev.fieldIdx === fieldIdx && prev.resourceIdx === resourceIdx;
            const sameDate = prev.date === dateKey;

            if (!sameCourt || !sameDate) {
                return { fieldIdx, resourceIdx, hours: [hour], date: dateKey };
            }

            const hoursSet = new Set(prev.hours);

            if (hoursSet.has(hour)) {
                return null;
            }

            const nextHours = [...hoursSet, hour].sort((a, b) => a - b);

            if (!isContiguous(nextHours)) {
                return { fieldIdx, resourceIdx, hours: [hour], date: dateKey };
            }

            return { ...prev, hours: nextHours };
        });
    };

    return (
        <div className="booking-page">
            <Loading isLoading={loading} text={"取得場地資訊中..."} />
            <Navbar />
            <div className="flex w-[150px] gap-2.5 items-end m-5 md:ml-[50px]">
                <button onClick={() => window.history.back()} className="flex items-center gap-2.5 text-xl text-gray-500 hover:text-black transition-colors duration-300">
                    <FaArrowLeft />
                    返回場地列表
                </button>
            </div>

            <div className="main-container px-4">

                {/* 左側 */}
                <div className="left-panel w-full">
                    
                    <div className="md:px-[50px]">
                        <h2 className="flex justify-self-start text-3xl font-medium">{fieldInfo?.name ?? "載入中..."}</h2>
                        <p className="field-description">
                            {fieldInfo?.description ?? ""}
                        </p>
                    </div>
                    {/* Tabs */}
                    <div className="flex flex-row w-full md:w-[60%] justify-between mx-auto bg-blue-50 p-1.5 rounded-lg">
                        <button
                            className={`tab w-full  px-2 py-2 text-sm whitespace-nowrap overflow-hidden text-ellipsis ${activeTab === 'info' ? 'active' : ''}`}
                            onClick={() => setActiveTab('info')}
                        >
                            場地資訊
                        </button>
                        <button
                            className={`tab w-full min-w-0 px-2 py-2 text-sm whitespace-nowrap overflow-hidden text-ellipsis ${activeTab === 'rule' ? 'active' : ''}`}
                            onClick={() => setActiveTab('rule')}
                        >
                            使用規則
                        </button>
                        <button
                            className={`tab w-full min-w-0 px-2 py-2 text-sm whitespace-nowrap overflow-hidden text-ellipsis ${activeTab === 'facility' ? 'active' : ''}`}
                            onClick={() => setActiveTab('facility')}
                        >
                            設施
                        </button>
                    </div>

                    {/* Info */}
                    {activeTab === 'info' && hasData && (
                        <div className="info-section">
                            <div className="flex flex-row w-[200px] border border-gray-300 rounded-xl items-center justify-center p-2.5 gap-4 shadow-lg">
                                <IoMdPeople className="text-4xl text-blue-600"/>
                                <div className="text">
                                    <div className="label">容納人數</div>
                                    <div className="font-medium text-lg">{fieldInfo?.capacity ?? "-"}</div>
                                </div>
                            </div>
                            <div className="flex flex-row w-[200px] border border-gray-300 rounded-xl items-center justify-center p-2.5 gap-4 shadow-lg">
                                <FaClock className="text-2xl text-blue-600"/>
                                <div className="text">
                                    <div className="label">開放時間</div>
                                    <div className="font-medium text-lg">
                                        {(fieldInfo?.opening_hours_start
                                            ? fieldInfo.opening_hours_start.slice(0, 5)
                                            : "-")}
                                        <span className="mx-0.5 text-gray-400">–</span>
                                        {(fieldInfo?.opening_hours_end
                                            ? fieldInfo.opening_hours_end.slice(0, 5)
                                            : "-")}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-row w-[200px] border border-gray-300 rounded-xl items-center justify-center p-2.5 gap-4 shadow-lg">
                                <FaMapPin className="text-2xl text-blue-600"/>
                                <div className="text">
                                    <div className="label">位置</div>
                                    <div className="value">T4教學大樓旁</div>
                                </div>
                            </div>
                            <div className="flex flex-row w-[200px] border border-gray-300 rounded-xl items-center justify-center p-2.5 gap-6 shadow-lg">
                                <GrStatusInfo className="text-2xl font-bold text-blue-600"/>
                                <div className="text">
                                    <div className="label">場地狀態</div>
                                    <div
                                        className={`value ${isOpen ? 'status-open' : 'status-closed'}`}
                                        onClick={() => setIsOpen(!isOpen)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {isOpen ? '開放' : '關閉'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'rule' && (
                        <div className="rule-section">
                            <ol className="rule-list">
                                <li>禁止在場地內飲食，只允許飲用水</li>
                                <li>請保持場地清潔，離開時帶走所有個人物品和垃圾</li>
                                <li>預約後請準時到場，遲到超過15分鐘視為棄權</li>
                                <li>雨天或場地維修時，場地可能會臨時關閉</li>
                            </ol>
                        </div>
                    )}

                    {activeTab === 'facility' && (
                        <div className="facility-section">
                            <div className="facility-list">
                                <div className="facility-card">籃球架 x2</div>
                                <div className="facility-card">觀眾席</div>
                                <div className="facility-card">更衣室</div>
                                <div className="facility-card">淋浴間</div>
                                <div className="facility-card">無障礙設施</div>
                            </div>
                        </div>
                    )}
                    <div className="field-board flex justify-center">
                        {false === 'true' ? (
                            <img src={imgUrl} alt="場地圖片" className="field-image" />
                        ) : (
                            <FieldPicker fieldId={id} />
                        )}
                    </div>
                </div>
                {/* 預約section */}
                <div className="flex flex-col md:mx-[50px] mt-5 p-4 md:p-8 bg-white border border-gray-300 rounded-2xl shadow-lg">
                    <h4 className="flex justify-start text-3xl font-medium">場地時段金額總覽</h4>
                    <p className="flex justify-start my-2 text-gray-400">選擇日期與時間進行預約</p>
                    <div className="w-full mt-5 flex justify-center items-center">
                        <Calendar onDayPicked={({ date }) => {
                            setSelectedDate(date);
                        }} />
                    </div>
                    {/* 七日單場地表格 */}
                    <div className="overflow-x-auto my-2 rounded-2xl">
                        <table className="min-w-full border-collapse shadow-sm text-center text-sm">
                            <thead>
                                <tr>
                                    <th className="sticky text-lg left-0 z-30 px-4 py-2 border whitespace-nowrap border-gray-300 bg-blue-100">
                                        {fieldInfo?.name ?? "場地名稱"}
                                    </th>

                                    {sevenDays.map((day, idx) => {
                                        return (
                                            <th
                                                id={`day-column-${idx}`}
                                                key={idx}
                                                className={`px-4 py-2 border whitespace-nowrap cursor-pointer border-gray-300 ${idx === 3 ? "bg-blue-400" : "bg-blue-100"}`}
                                            >
                                                <div
                                                    className={`flex text-center justify-center text-lg`}
                                                >
                                                    {formatDate(day)}
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    HOURS.map((h) => {
                                        const start = `${h}:00`;
                                        const end = `${h + 1}:00`;
                                        const isLunch = h === 20; // 之後依需求改成訂單判斷

                                        return (
                                            <tr key={h} className={isLunch ? "bg-gray-50" : "bg-white"}>
                                                {/* 左側時段欄 */}
                                                <td className="sticky left-0 z-20 font-semibold px-4 py-3 border whitespace-nowrap border-gray-300 bg-blue-50 text-center">
                                                    {start} - {end}
                                                </td>

                                                {/* 每個日期一格 */}
                                                {sevenDays.map((day, colIdx) => (
                                                    <td key={colIdx} className="px-3 py-3 border border-gray-300">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {Array.from(
                                                                { length: 5 },
                                                                (_, i) => (
                                                                    <button
                                                                        key={i}
                                                                        type="button"
                                                                        onClick={() => { }

                                                                        }
                                                                        className={`bg-blue-100 w-8 h-10 rounded-full font-semibold flex items-center justify-center transition`}
                                                                    >
                                                                        {i + 1}
                                                                    </button>
                                                                )
                                                            )}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })
                                }
                            </tbody>
                        </table>
                    </div>

                    <button className="book-now" onClick={() => { /* TODO: implement booking submit */ }}>立即預約</button>
                </div>
            </div>
        </div>
    );
}

export default Bookpage;
