import Navbar from "../components/navbar";
import { FaArrowLeft } from "react-icons/fa";
import "./bookingpage.css";
import Calendar from "../components/dayPick";
import { useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import FieldPicker from "../components/fieldPicker";
import TimeSelect from "../components/timeSelect";

const OPEN_HOUR = 8;
const CLOSE_HOUR = 22;
const HOURS = Array.from({ length: CLOSE_HOUR - OPEN_HOUR }, (_, i) => OPEN_HOUR + i);
const RESERVED_BOOKINGS = [
    { start: 17, end: 20, title: "校隊訊練" },
];

function Bookpage() {
    const { name, isSchool, pict } = useParams();
    const imgUrl = '/field_img/' + pict;
    const [activeTab, setActiveTab] = useState("info");
    const [isOpen, setIsOpen] = useState(true);
    const [selectedField, setSelectedField] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedWeekday, setSelectedWeekday] = useState();
    const [selectedSlot, setSelectedSlot] = useState(null);

    const handkeBooking = useCallback(() => {
    })

    return (

        <div className="booking-page">
            <Navbar />
            <div class="flex w-[150px] gap-2.5 items-end m-5 md:ml-[50px]">
                <button onClick={() => window.history.back()} class="flex items-center gap-2.5 text-xl text-gray-500 hover:text-black transition-colors duration-300">
                    <FaArrowLeft />
                    返回場地列表
                </button>
            </div>

            <div className="main-container" class="px-4">

                {/* 左側 */}
                <div className="left-panel">
                    <div className="field-board" class="flex justify-center">
                        {isSchool === 'true' ? (
                            <img src={imgUrl} alt="場地圖片" className="field-image" />
                        ) : (
                            <FieldPicker
                                fieldName={name}
                                selectedId={selectedField}
                                onSelectField={({ id }) => setSelectedField(id)}
                            />
                        )}
                    </div>
                    <div class="md:px-[50px]">
                        <h2 class="flex justify-self-start text-3xl font-medium">{name}</h2>
                        <p className="field-description">跟你們介紹一下這個網球場，這裡是拿來打籃球的，
                            不是打羽球的
                        </p>
                    </div>
                    {/* Tabs */}
                    <div className="tab-container w-full min-width 260px max-w-[450px] mx-auto m-3 flex justify-center gap-7 border border-gray-200 rounded-lg">
                        <button className={`tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>場地資訊</button>
                        <button className={`tab ${activeTab === 'rule' ? 'active' : ''}`} onClick={() => setActiveTab('rule')}>使用規則</button>
                        <button className={`tab ${activeTab === 'facility' ? 'active' : ''}`} onClick={() => setActiveTab('facility')}>設施</button>
                    </div>

                    {/* Info */}
                    {activeTab === 'info' && (
                        <div className="info-section">
                            <div className="info-card">
                                <div className="icon">👥</div>
                                <div className="text">
                                    <div className="label">容納人數</div>
                                    <div className="value">20人</div>
                                </div>
                            </div>
                            <div className="info-card">
                                <div className="icon">🕒</div>
                                <div className="text">
                                    <div className="label">開放時間</div>
                                    <div className="value">08:10 - 22:00</div>
                                </div>
                            </div>
                            <div className="info-card">
                                <div className="icon">📍</div>
                                <div className="text">
                                    <div className="label">位置</div>
                                    <div className="value">T4教學大樓旁</div>
                                </div>
                            </div>
                            <div className="info-card">
                                <div className="icon">ℹ️</div>
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
                </div>
                {/* 右側 */}
                <div className="right-panel">
                    <h4>場地時段金額總覽</h4>
                    <p>選擇日期與時間進行預約</p>
                    <div class="overflow-x-auto xl:overflow-visible mt-[20px] mb-[100px] border border-gray-100 rounded-lg shadow-neutral-800 w-full xl:w-auto mx-auto">
                        <table class="w-full min-w-[900px] md:w-full rounded-lg border-collapse shadow-sm text-center text-sm mx-auto">
                            <thead class="bg-blue-100 text-gray-700 text-lg">
                                <tr>
                                    <th class="px-2 py-2 font-semibold sticky left-0 bg-blue-100 min-w-[80px] text-sm">
                                        時間
                                    </th>

                                    {Array.from({ length: 7 }, (_, i) => {
                                        const d = new Date();
                                        d.setDate(d.getDate() + i);
                                        return (
                                            <th
                                                key={i}
                                                className="px-3 py-2 border border-gray-300 whitespace-nowrap"
                                            >
                                                {d.toLocaleDateString("zh-TW", {
                                                    weekday: "short",
                                                    month: "numeric",
                                                    day: "numeric",
                                                })}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>

                            <tbody>
                                {HOURS.map((hour) => (
                                    <tr key={hour} className="hover:bg-gray-50 transition">
                                        <td className="px-2 py-2 border border-gray-300 sticky left-0 bg-blue-50 text-sm z-50">
                                            {`${hour}:00 - ${hour + 1}:00`}
                                        </td>

                                        {Array.from({ length: 7 }, (_, i) => {
                                            const date = new Date();
                                            date.setDate(date.getDate() + i);
                                            const key = `${date.toDateString()}-${hour}`;
                                            const isFull = hour === 12;
                                            const isSelected = selectedSlot === key;

                                            return (
                                                <td
                                                    key={i}
                                                    onClick={() => !isFull && setSelectedSlot(prev => (prev === key ? null : key))}
                                                    class={`
                                      px-2 py-3 border border-gray-300 text-sm font-medium rounded
                                      text-blue-600
                                      transition
                                      ${isFull
                                                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                            : isSelected
                                                                ? "bg-blue-600 text-white shadow-md scale-105 cursor-pointer"
                                                                : "bg-white hover:bg-blue-200 cursor-pointer"
                                                        }
                                    `}
                                                >
                                                    {isFull ? "已滿" : "$200"}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button className="book-now" onClick={handkeBooking}>立即預約</button>
                </div>
            </div>
        </div>
    );
}

export default Bookpage;
