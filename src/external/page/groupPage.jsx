import Navbar from "../components/navbar";
import Loading from "../../components/loading";

import { facilityMap, functionIconMap } from "../../constant/IconMap";
import { zhTWDictionary } from "../../locale/zh-TW/translate";
import { useState, useEffect } from "react";
import { pickUpService } from "../../service/pickUpService";
import { formatDateTime } from "../../components/dateTimeFormat";
import { zhTWDictionary as dictionary } from "../../locale/zh-TW/translate";
import { statusMap } from "../../constant/statusMap";
import { errorPopup, successPopup } from "../../components/pop-up";
import { useNavigate } from "react-router-dom";

import DayPicker from "../../components/dayPick";
import GroupNearbyMap from "../components/groupNearbyMap";


export function GroupPage() {
    const [expandedGroups, setExpandedGroups] = useState({});
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [joiningGroupId, setJoiningGroupId] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGroups = async () => {
            setLoading(true);
            try {
                const data = await pickUpService.getPickUpList();
                setGroups(data || []);
            } catch (error) {
                console.error("Error fetching groups:", error);
                errorPopup(dictionary.pickUp.errorMessage.error, dictionary.pickUp.errorMessage.fetchFailed);

            } finally {
                setLoading(false);
            }
        }
        fetchGroups();
    }, [setGroups, refreshTrigger]);

    const handleJoinGroup = async (groupId) => {
        setJoiningGroupId(groupId);

        try {
            await pickUpService.joinPickUpGroup(groupId);
            setGroups((prevGroups) =>
                prevGroups.map((group) => group.id === groupId ? {
                    ...group, enrolledStatus: "pending",
                    current_enrolled: Number(group.current_enrolled || 0) + 1
                } : group)
            );

            setExpandedGroups((prev) => ({
                ...prev,
                [groupId]: false,
            }));
            successPopup("", dictionary.pickUp.successMessage.registrationSuccess);
        } catch (error) {
            errorPopup(dictionary.pickUp.errorMessage.error, dictionary.pickUp.errorMessage.registrationFailed);
            setRefreshTrigger((pre) => pre + 1);
        } finally {
            setJoiningGroupId(null);
        }
    };

    return (
        <div>
            <Navbar />
            <h1 className="text-3xl font-bold text-center my-8">{zhTWDictionary.groupPage.title}</h1>
            <Loading isLoading={loading} text={zhTWDictionary.groupPage.loadingMessage} />
            <GroupNearbyMap groups={groups} />
            <DayPicker selectedDate={null} onDateChange={() => { }} />

            {!loading && groups.length === 0 && <p className="text-center text-gray-500">{zhTWDictionary.groupPage.groupEmpty}</p>}
            <div className="pb-16">
                {groups.map((group) => {
                    const isFull = Number(group.current_enrolled || 0) >= Number(group.capacity || 0);
                    const isExpanded = expandedGroups[group.id] || false;
                    const isJoining = joiningGroupId === group.id;
                    const status = group.enrolledStatus;

                    return (
                        <div key={group.id} className="w-[95%] md:w-[80%] mx-auto mb-4 p-5 border border-gray-200 rounded-xl shadow-sm bg-white">

                            {/* 標題與人數狀態 */}
                            <div className="flex justify-between items-start mb-3">
                                <h2 className="text-xl font-bold text-gray-900">{group.title}</h2>
                                <div className={`text-sm font-semibold px-3 py-1 rounded-full ${isFull ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
                                    {group.current_enrolled || 0}/{group.capacity || 0} 人
                                </div>
                            </div>

                            {/* 詳細資訊*/}
                            <div className="text-sm text-gray-600 space-y-1.5 mb-5">
                                <p>{group.location.name || "-"}</p>
                                <p>{formatDateTime(group.start_time).date} | {formatDateTime(group.start_time).time}</p>
                                <p>{group.host_display_name}</p>
                            </div>

                            {/* 展示設施*/}
                            <div className="mb-5">
                                <p className="text-sm font-medium text-gray-700 mb-2">{zhTWDictionary.groupPage.label.facilities}:</p>

                                <div className="w-fit flex flex-wrap gap-2 p-1 border border-gray-200 rounded-md bg-white relative ">

                                    {group.facilities?.map((facilityKey, index) => {
                                        const facility = facilityMap[facilityKey];
                                        return (
                                            <span
                                                key={index}
                                                className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm border border-gray-200"
                                            >
                                                <span className="opacity-60">{facility?.icon}</span>
                                                <span className="font-medium">{facility?.name}</span>
                                            </span>
                                        )
                                    })}

                                </div>
                            </div>

                            {/*費用程度標籤與報名按鈕 */}
                            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-gray-100 gap-4">
                                <div className="flex items-center justify-between gap-2 w-full sm:w-auto">
                                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-base font-medium">{zhTWDictionary.groupPage.label.level}: {group.skill_level.name || zhTWDictionary.groupPage.label.levelNull}</span>
                                    <span className={`px-3 py-1 my-[auto] rounded-md text-base font-bold border ${(group.fee !== 0) ? 'text-green-700 bg-green-50 border-green-200' : 'text-gray-700'}`} >$ {group.fee}</span>

                                </div>

                                <button
                                    disabled={status !== null || isFull}
                                    onClick={() => handleJoinGroup(group.id)}
                                    className={`w-full sm:w-auto px-6 py-2 rounded-lg transition font-bold tracking-wide text-white 
                                        ${(status !== null || isFull) ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"} 
                                        ${isFull && status === null ? statusMap.full.class : (statusMap[status]?.class || statusMap.default.class)}
                                    `}
                                >
                                    {status !== null
                                        ? (statusMap[status]?.label || statusMap.default.label)
                                        : isFull
                                            ? statusMap.full.label
                                            : statusMap.default.label}
                                </button>
                            </div>

                        </div>
                    );
                })}
                {/* 重新載入按鈕 */}
                <button
                    onClick={() => setRefreshTrigger(prev => prev + 1)}
                    className="fixed bottom-4 right-4 z-50 flex items-center justify-center gap-2 bg-gray-700 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    <span className="font-bold tracking-wider">{zhTWDictionary.groupPage.button.refresh}</span>
                </button>

                {/* 申請加入臨打團按鈕 */}
                <button
                    onClick={() => navigate("/external/apply-host")}
                    className="fixed bottom-4 left-4 z-50 flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                    {functionIconMap.add.icon}
                    <span className="font-bold tracking-wider">{zhTWDictionary.groupPage.button.hostApply}</span>
                </button>
            </div>
        </div>
    )
}
