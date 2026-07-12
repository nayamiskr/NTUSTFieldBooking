import Navbar from "../components/navbar";
import { useState, useEffect } from "react";
import { pickUpService } from "../../service/pickUpService";
import { formatDateTime } from "../../components/dateTimeFormat";
import Loading from "../../components/loading";

import {
    Droplet, ShowerHead, Shirt, Users,
    LampCeiling, Volleyball, AirVent, Wifi
} from "lucide-react";

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
                        <div className="w-[95%] md:w-[80%] mx-auto mb-4 p-5 border border-gray-200 rounded-xl shadow-sm bg-white">

                            {/* 標題與人數狀態 */}
                            <div className="flex justify-between items-start mb-3">
                                <h2 className="text-xl font-bold text-gray-900">{group.title}</h2>
                                <div className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                    {group.current_enrolled || 0}/{group.capacity || 0} 人
                                </div>
                            </div>

                            {/* 詳細資訊*/}
                            <div className="text-sm text-gray-600 space-y-1.5 mb-5">
                                <p>{group.location.name || "-"}</p>
                                <p>{group.date} {group.time}</p>
                                <p>{group.host_name} | {group.host_phone}</p>
                            </div>

                            {/* 展示設施*/}
                            <div className="mb-5">
                                <p className="text-sm font-medium text-gray-700 mb-2">設施</p>

                                <div className="w-full md:w-fit flex flex-wrap gap-2 p-1 border border-gray-200 rounded-md bg-white relative ">

                                    {[
                                        { name: '飲水機', icon: <Droplet /> },
                                        { name: '淋浴間', icon: <ShowerHead /> },
                                        { name: '更衣室', icon: <Shirt /> },
                                        { name: '廁所', icon: <Users /> },
                                        { name: '照明設備', icon: <LampCeiling /> },
                                        { name: '冷氣', icon: <AirVent /> }
                                    ].map((facility, index) => (
                                        <span
                                            key={index}
                                            className="flex items-center gap-1.6 bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm border border-gray-200"
                                        >
                                            <span className="opacity-60">{facility.icon}</span>
                                        </span>
                                    ))}

                                </div>
                            </div>

                            {/*費用程度標籤與報名按鈕 */}
                            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-gray-100 gap-4">
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm font-medium">$150</span>
                                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm font-medium">程度: C</span>

                                </div>

                                {/* 手機版按鈕寬度 100%，更好按 */}
                                <button className="w-full sm:w-auto bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition font-medium tracking-wide">
                                    立即報名
                                </button>
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    )
}
