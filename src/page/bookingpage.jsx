import Navbar from "../components/navbar";
import { FaArrowLeft } from "react-icons/fa";
import "./bookingpage.css";
import Calendar from "../components/dayPick";
import { useState } from "react";

function Bookpage() {
    const [activeTab, setActiveTab] = useState("info");
    const [isOpen, setIsOpen] = useState(true);
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
                    <div className="field-image">
                        <img src="/field_img/basketball.jpg" alt="網球場一號" className="field-image" />
                    </div>
                    <h2>籃球場一號場地</h2>
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
                        <button className="time active">09:00 - 10:00</button>
                        <button className="time">10:00 - 11:00</button>
                        <button className="time">11:00 - 12:00</button>
                        <button className="time">12:00 - 13:00</button>
                        <a className="more-time" href="#">查看更多時間</a>
                    </div>
                    <button className="book-now">立即預約</button>
                </div>
            </div>
        </div>
    );
}

export default Bookpage;