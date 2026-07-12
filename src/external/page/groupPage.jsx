import Navbar from "../components/navbar";
import { useState, useEffect } from "react";
import { pickUpService } from "../../service/pickUpService";
import { formatDateTime } from "../../components/dateTimeFormat";
import Loading from "../../components/loading";

export function GroupPage() {
    const [expandedGroups, setExpandedGroups] = useState({});
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [joiningGroupId, setJoiningGroupId] = useState(null);

    useEffect(() => {
        const fetchGroups = async () => {
            setLoading(true);
            try {
                const data = await pickUpService.getPickUpList();
                setGroups(data || []);
            } catch (error) {
                console.error("Error fetching groups:", error);
                alert("取得臨打團清單失敗，請稍後再試。");

            } finally {
                setLoading(false);
            }
        }
        fetchGroups();
    }, []);

    const handleJoinGroup = async (groupId) => {
        setJoiningGroupId(groupId);

        try {
            await pickUpService.joinPickUpGroup(groupId);
            setGroups((prevGroups) =>
                prevGroups.map((group) =>
                    group.id === groupId
                        ? {
                            ...group,
                            current_enrolled: Math.min(
                                Number(group.current_enrolled || 0) + 1,
                                Number(group.capacity || 0)
                            ),
                        }
                        : group
                )
            );
            setExpandedGroups((prev) => ({
                ...prev,
                [groupId]: false,
            }));
            alert("報名成功，已送出臨打申請。");
        } catch (error) {
            console.error("Error joining group:", error);
        } finally {
            setJoiningGroupId(null);
        }
    };

    const handleGroupButtonClick = (group) => {
        const isFull = Number(group.current_enrolled || 0) >= Number(group.capacity || 0);
        if (isFull || joiningGroupId === group.id) return;

        if (expandedGroups[group.id]) {
            handleJoinGroup(group.id);
            return;
        }

        setExpandedGroups(prev => ({
            ...prev,
            [group.id]: true
        }));
    };

    const getButtonText = ({ isFull, isExpanded, isJoining }) => {
        if (isFull) return "報名已滿";
        if (isJoining) return "報名中...";
        if (isExpanded) return "立即報名";
        return "查看詳細";
    };

    const getLocationText = (location) => {
        if (!location) return "-";
        if (typeof location === "string") return location;
        return location.name || location.location_info || "-";
    };

    return (
        <div>
            <Navbar />
            <h1 className="text-3xl font-bold text-center my-8">已開團的清單</h1>
            <Loading isLoading={loading} text="取得臨打團資料中..." />
            {!loading && groups.length === 0 && <p className="text-center text-gray-500">暫無可預約的團</p>}
            <div>
                {groups.map((group) => {
                    const isFull = Number(group.current_enrolled || 0) >= Number(group.capacity || 0);
                    const isExpanded = expandedGroups[group.id] || false;
                    const isJoining = joiningGroupId === group.id;

                    return (
                        <div
                            key={group.id}
                            className={`flex w-[80%] justify-self-center justify-between border border-blue-300 rounded-md p-4 mb-4 mx-auto ${isFull ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className="flex flex-col text-left">
                                <p className="text-xl font-semibold text-gray-900">{group.title}</p>
                                <p className="text-md text-gray-500">位置: {getLocationText(group.location.name)}</p>
                                <p className="text-sm text-gray-500 mt-8">{formatDateTime(group.start_time).date}</p>
                                <p className="text-sm text-gray-500">{formatDateTime(group.start_time).time}</p>
                                {/* 動態展開容器 */}
                                <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                    <div className="overflow-hidden">
                                        <p className="text-sm text-gray-500">負責人: {group.host_name} | 負責人電話: {group.host_phone}</p>
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
                                <div className="text-lg font-semibold text-gray-900">
                                    報名人數
                                    <p className={isFull ? "text-red-500" : "text-blue-500"}>
                                        ({group.current_enrolled}/{group.capacity})
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleGroupButtonClick(group)}
                                    disabled={isFull || isJoining}
                                    className={`text-sm border border-blue-300 rounded-md mt-4 py-2 px-4 ${isFull || isJoining ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:bg-gray-100'}`}
                                >
                                    {getButtonText({ isFull, isExpanded, isJoining })}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}
