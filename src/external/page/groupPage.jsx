import { Nav } from "react-day-picker";
import Navbar from "../components/navbar";
import { useState, useEffect } from "react";
import { pickUpService } from "../../service/pickUpService";
import { formatDateTime } from "../../components/dateTimeFormat";

export function GroupPage() {
    const [expandedGroups, setExpandedGroups] = useState({}); // { groupId: boolean }
    const [groups, setGroups] = useState([]); 
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchGroups = async () => {
            setLoading(true);
            try {
                const data = await pickUpService.getPickUpList();
                setGroups(data.items);
            } catch (error) {
                console.error("Error fetching groups:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchGroups();
    }, []);

    return (
        <div>
            <Navbar />
            <h1 className="text-3xl font-bold text-center my-8">已開團的清單</h1>
            {loading && <p className="text-center text-gray-500">加載中...</p>}
            {!loading && groups.length === 0 && <p className="text-center text-gray-500">暫無可預約的團</p>}
            <div>
                {groups.map((group) => {
                    const isFull = group.currentParticipants >= group.maxParticipants;
                    const isExpanded = expandedGroups[group.id] || false;
                    
                    return (
                        <div
                            key={group.id}
                            className={`flex w-[80%] justify-self-center justify-between border border-blue-300 rounded-md p-4 mb-4 mx-auto ${isFull ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className="flex flex-col text-left">
                                <p className="text-xl font-semibold text-gray-900">{group.title}</p>
                                <p className="text-md text-gray-500">位置: {group.location}</p>
                                <p className="text-sm text-gray-500 mt-8">{formatDateTime(group.start_time)}</p>
                                {/* 動態展開容器 */}
                                <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                    <div className="overflow-hidden">
                                        <p className="text-sm text-gray-500">負責人: 我 | 負責人電話: 0978712894</p>
                                        <div className="flex flex-row gap-4 pt-4">
                                            <div className="p-2 border border-blue-300 ">
                                                <p className="text-md font-semibold text-gray-900">費用: {group.fee}</p>
                                            </div>          
                                            <div className="p-2 border border-blue-300">
                                                <p className="text-md font-semibold text-gray-900">程度: {group.skill_level}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col text-right justify-between ml-4">
                                <p className="text-lg font-semibold text-gray-900">
                                    報名人數
                                    <p className={isFull ? "text-red-500" : "text-blue-500"}>
                                        (0/{group.capacity})
                                    </p>
                                </p>
                                <button
                                    onClick={() => {
                                        if (!isFull) {
                                            setExpandedGroups(prev => ({
                                                ...prev,
                                                [group.id]: !prev[group.id]
                                            }));
                                        }
                                    }}
                                    disabled={isFull}
                                    className={`text-sm border border-blue-300 rounded-md mt-4 py-2 px-4 ${isFull ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:bg-gray-100'}`}
                                >
                                    {isFull ? "報名已滿" : isExpanded ? "立即報名" : "查看詳細"}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}