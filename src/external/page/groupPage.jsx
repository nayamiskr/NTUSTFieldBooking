import { Nav } from "react-day-picker";
import Navbar from "../components/navbar";
import { useState } from "react";

export function GroupPage() {
    const [showInfo, setShowInfo] = useState(false);

    return (
        <div>
            <Navbar />
            <h1 class="text-3xl font-bold text-center my-8">已開團的清單</h1>
            <li>
                {/* 可預約的版本 */}
                <div className="flex w-[80%] justify-self-center justify-between border border-blue-300 rounded-md p-4 mb-4">
                    <div className="flex flex-col text-left">
                        <p className="text-xl font-semibold text-gray-900">今天打羽球</p>
                        <p className="text-md text-gray-500">位置: 台北市體育館</p>
                        <p className="text-sm text-gray-500">2026-10-10 14:00 - 16:00</p>
                        {/* 動態展開容器 */}
                        <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${showInfo ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                            <div className="overflow-hidden">
                                <p className="text-sm text-gray-500">負責人: 蔡德文 | 負責人電話: 0912-345-678</p>
                                <div className="flex flex-row gap-4 pt-4"> {/* 這裡加點 padding 讓內容展開時不擁擠 */}
                                    <div className="p-2 border border-blue-300 rounded-md">
                                        <p className="text-md font-semibold text-gray-900">費用: 200</p>
                                    </div>
                                    <div className="p-2 border border-blue-300 rounded-md">
                                        <p className="text-md font-semibold text-gray-900">程度: B</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="flex flex-col text-right justify-between">
                        <p className="text-lg font-semibold text-gray-900">報名人數{<p className="text-blue-500">(5/10)</p>}</p>
                        <button onClick={() => (showInfo)? alert("已成功幫您報名") : setShowInfo(!showInfo)} className="text-sm text-blue-500 border border-blue-300 rounded-md mt-4 py-2 px-4 hover:bg-gray-100">{(showInfo) ? "立即報名" : "查看詳細"}</button>
                    </div>
                </div>

                {/* 無法預約的版本 */}
                <div className="flex w-[80%] justify-self-center justify-between border border-blue-300 opacity-50 rounded-md p-4 cursor-not-allowed">
                    <div className="flex flex-col text-left">
                        <p className="text-xl font-semibold text-gray-900">今天不能打羽球</p>
                        <p className="text-md text-gray-500">位置: 新北市體育館</p>
                        <p className="text-sm text-gray-500 mt-auto">2026-10-12 14:00 - 16:00</p>

                    </div>
                    <div className="flex flex-col text-right justify-between">
                        <p className="text-lg font-semibold text-gray-900">報名人數{<p className="text-red-500">(10/10)</p>}</p>
                        <p className="text-sm text-blue-500 border border-blue-300 rounded-md py-2 px-4">報名已滿</p>
                    </div>
                </div>
            </li>
        </div>
    )
}