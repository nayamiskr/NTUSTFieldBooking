import Navbar from "../components/navbar";
import { FaArrowLeft } from "react-icons/fa";
import "./bookingpage.css";
import Calendar from "../components/dayPick";
import { useState } from "react";
import { useParams } from "react-router-dom";
import FieldPicker from "../components/fieldPicker";

function Bookpage() {
    const { name, isSchool, pict } = useParams();
    const imgUrl = '/field_img/' + pict;
    const [activeTab, setActiveTab] = useState("info");
    const [isOpen, setIsOpen] = useState(true);
    const [selectedField, setSelectedField] = useState(null);
    const timeSlots = ["8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const availableTimes = timeSlots.filter(time => time !== "10:00" && time !== "11:00");
    const parseTime = (t) => parseInt(t.split(":")[0], 10);
    const handleBooking = () => {
        if (!startTime || !endTime) {
            alert("請選擇開始和結束時間");
            return;
        }
        if (startTime >= endTime) {
            alert("結束時間必須晚於開始時間");
            return;
        }
        alert(`已成功預約 ${name}的 ${selectedField}，時間：${startTime} - ${endTime}`);
    };

    return (

        <div className="booking-page">
            <Navbar />
            <div className="back-button">
                <button onClick={() => window.history.back()}>
                    <FaArrowLeft />
                    返回場地列表
                </button>
            </div>

            <div className="main-container">
                {/* 左側 */}
                <div className="left-panel">
                    <div className="field-board">
                        {isSchool === 'true' ? (
                            <img src={imgUrl} alt="場地圖片" className="field-image" />
                        ) : (
                            <FieldPicker areaList={[1, 2, 3, 4, 5, 6]} onSelectField={setSelectedField} />
                        )}
                    </div>

                    <h2>{name}</h2>
                    <p className="field-description">跟你們介紹一下這個網球場，這裡是拿來打籃球的，
                        不是打羽球的
                    </p>

                    {/* Tabs */}
                    <div className="tab-container">
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
                    <h4>預約場地</h4>
                    <p>選擇日期與時間進行預約</p>

                    <div className="calendar">
                        <Calendar />
                    </div>

                    <div className="time-select">
                        <div className="time-dropdown">
                            <label htmlFor="start-time">開始時間：</label>
                            <select className="start-time" value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                                {availableTimes.map((time, index) => (
                                    <option key={index} value={time}>{time}</option>
                                ))}
                            </select>
                        </div>

                        <div className="time-dropdown">
                            <label htmlFor="end-time">結束時間：</label>
                            <select className="end-time" value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                                {availableTimes
                                    .filter((time) => parseTime(time) > parseTime(startTime))
                                    .map((time, index) => (
                                        <option key={index} value={time}>{time}</option>
                                    ))}
                            </select>
                        </div>
                    </div>
                    <button className="book-now" onClick={handleBooking}>立即預約</button>
                </div>
            </div>
        </div>
    );
}

export default Bookpage;