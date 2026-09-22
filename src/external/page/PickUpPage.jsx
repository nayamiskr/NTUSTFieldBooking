import { useMemo } from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/navbar";
import Loading from "../../components/loading";
import Calendar from "../../components/dayPicker/dayPick";
import GroupNearbyMap from "../components/pickUp/pickUpNearbyMap";
import { formatDateTime } from "../../utils/dateTimeFormat";
import { getDistance } from "../../utils/distance";
import { errorPopup, successPopup } from "../../components/pop-up";
import PickUpDetailPopUp from "../components/pickUp/pickUpDetailPopUp";

import { facilityMap, functionIconMap, InfoIconMap, sportIconMap } from "../../constant/IconMap";
import { statusMap } from "../../constant/statusMap";
import { zhTWDictionary } from "../../locale/zh-TW/translate";
import { pickUpService } from "../../service/pickUpService";



export default function PickUpPage() {
    const navigate = useNavigate();

    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState("location");
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [isDetailModalClosing, setIsDetailModalClosing] = useState(false);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    const userPosition = localStorage.getItem('currentPosition');
    const options = [
        { value: 'location', label: '距離近' },
        { value: 'time', label: '快開始' },]

    const sortedGroups = useMemo(() => {
        if (!groups || groups.length === 0) return [];

        const copyGroups = [...groups];

        if (activeFilter === 'time') {
            return copyGroups.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
        }

        if (activeFilter === 'location') {
            return copyGroups.sort((a, b) => {
                if (!a.location || !b.location) return 0;
                const distA = getDistance(userPosition.lat, userPosition.lng, a.location.lat, a.location.lng);
                const distB = getDistance(userPosition.lat, userPosition.lng, b.location.lat, b.location.lng);
                return distA - distB;
            });
        }

        return copyGroups;
    }, [groups, activeFilter]);

    useEffect(() => {
        const sportTypeId = localStorage.getItem("sportType");
        const fetchGroups = async () => {
            setLoading(true);
            try {
                const data = await pickUpService.getPickUpList({
                    sport_id: sportTypeId,
                });
                setGroups(data || []);
            } catch (error) {
                console.error("Error fetching groups:", error);
                errorPopup(zhTWDictionary.pickUp.errorMessage.error, zhTWDictionary.pickUp.errorMessage.fetchFailed);

            } finally {
                setLoading(false);
            }
        }
        fetchGroups();
    }, [setGroups, refreshTrigger]);

    const handleJoinGroup = async (groupId) => {
        try {
            await pickUpService.joinPickUpGroup(groupId);
            setGroups((prevGroups) =>
                prevGroups.map((group) => group.id === groupId ? {
                    ...group, enrolledStatus: "pending",
                    current_enrolled: Number(group.current_enrolled || 0) + 1
                } : group)
            );

            successPopup("", zhTWDictionary.pickUp.successMessage.registrationSuccess);
            return true;
        } catch (error) {
            errorPopup(zhTWDictionary.pickUp.errorMessage.error, zhTWDictionary.pickUp.errorMessage.registrationFailed);
            setRefreshTrigger((pre) => pre + 1);
            return false;
        }
    };

    const openDetailModal = (group) => {
        setIsDetailModalClosing(false);
        setSelectedGroup(group);
    };

    const closeDetailModal = () => {
        setIsDetailModalClosing(true);
        window.setTimeout(() => {
            setSelectedGroup(null);
            setIsDetailModalClosing(false);
        }, 200);
    };

    const handleContactHost = (host) => {
        const contactUrl = host.contact_url || host.line_url || host.lineUrl;

        if (contactUrl) {
            window.open(contactUrl, "_blank", "noopener,noreferrer");
            return;
        }

        if (host.email) {
            window.location.href = `mailto:${host.email}`;
            return;
        }

        if (host.phone) {
            window.location.href = `tel:${host.phone}`;
        }
    };

    const renderFilters = (isMobile = false) => (
        <section aria-label="篩選場次" className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
                <p className="text-lg font-bold text-gray-900">篩選場次</p>
                {isMobile && (
                    <button
                        type="button"
                        aria-label="收合篩選"
                        onClick={() => setIsMobileFilterOpen(false)}
                        className="grid h-9 w-9 place-items-center rounded-full text-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                    >
                        {functionIconMap.cancel.icon}
                    </button>
                )}
            </div>

            <div className="space-y-5">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold tracking-wider text-gray-500">排序方式</label>
                    <div className="flex w-full rounded-lg bg-gray-100 p-1">
                        {options.map((opt) => (
                            <button
                                type="button"
                                key={opt.value}
                                onClick={() => {
                                    setActiveFilter(opt.value);
                                    if (isMobile) setIsMobileFilterOpen(false);
                                }}
                                className={`flex-1 rounded-md px-3 py-2 text-sm font-bold transition-all ${activeFilter === opt.value
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold tracking-wider text-gray-500">選擇日期</label>
                    <div className="flex items-center gap-2">
                        <Calendar onDayPicked={(day) => {
                            setSelectedDate(day.date);
                            if (isMobile) setIsMobileFilterOpen(false);
                        }} />
                        <button
                            type="button"
                            onClick={() => setSelectedDate(null)}
                            className="rounded-lg border border-red-100 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                            清除
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );

    return (
        <div>
            <Navbar />
            <h1 className="text-3xl font-bold text-center my-8">{zhTWDictionary.pickUpPage.title}</h1>
            <Loading isLoading={loading} text={zhTWDictionary.pickUpPage.loadingMessage} />

            <div className="mx-auto mb-8 w-[95%] max-w-7xl lg:flex lg:items-start lg:gap-6">
                {/* 桌面版Filter Section */}
                <aside className="sticky top-4 hidden w-72 shrink-0 lg:block">
                    {renderFilters()}
                </aside>

                <main className="min-w-0 flex-1">
                    {/* 手機板Filter Section */}
                    <div className="mb-4 lg:hidden">
                        <button
                            type="button"
                            aria-expanded={isMobileFilterOpen}
                            aria-controls="mobile-pickup-filters"
                            onClick={() => setIsMobileFilterOpen((isOpen) => !isOpen)}
                            aria-label={isMobileFilterOpen ? "收合篩選" : "展開篩選"}
                            className="ml-auto grid h-11 w-11 place-items-center rounded-lg border border-blue-200 bg-white text-blue-700 shadow-sm transition-opacity duration-300 hover:bg-blue-50"
                        >
                            <div>{functionIconMap.filter.icon}</div>
                        </button>
                    </div>

                    <div
                        className={`relative z-20 grid transition-[grid-template-rows,opacity,transform] duration-200 ease-out ${isMobileFilterOpen
                            ? "grid-rows-[1fr] translate-y-0 overflow-visible opacity-100"
                            : "grid-rows-[0fr] -translate-y-2 overflow-hidden opacity-0 pointer-events-none"
                            }`}
                    >
                        <div className={isMobileFilterOpen ? "overflow-visible" : "overflow-hidden"}>
                            {renderFilters(true)}
                        </div>
                    </div>

                    <GroupNearbyMap groups={groups} />

                    {/* {顯示臨打團清單} */}
                    {!loading && groups.length === 0 && <p className="text-center text-gray-500">{zhTWDictionary.pickUpPage.groupEmpty}</p>}
                    <div>
                        {sortedGroups.filter((group) => {
                            if (!selectedDate) return true;
                            const groupDate = formatDateTime(group.start_time).date;
                            console.log("groupDate", groupDate, "selectedDate", formatDateTime(selectedDate).date);
                            return groupDate === formatDateTime(selectedDate).date;
                        }).map((group) => {
                            const isFull = Number(group.current_enrolled || 0) >= Number(group.capacity || 0);
                            const status = group.enrolledStatus;

                            return (
                                <div key={group.id} className="mx-auto mb-4 p-5 border border-gray-200 rounded-xl shadow-sm bg-white">

                                    {/* 標題與人數狀態 */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex flex-row gap-2 items-center">
                                                <h2 className="text-xl font-bold text-gray-900">{group.title}</h2>
                                                <p className="text-sm text-gray-600 border border-gray-300 rounded-md px-2 py-1 flex flex-row gap-1 items-center">
                                                    {sportIconMap[group.sport.code]?.icon}
                                                    {group.sport?.name || "-"}
                                                </p>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-400">{zhTWDictionary.pickUpPage.label.hostName} {group.host?.display_name || "-"}</p>
                                        </div>

                                        <div className={`text-sm font-semibold px-3 py-1 rounded-full ${isFull ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
                                            {group.current_enrolled || 0}/{group.capacity || 0} 人
                                        </div>
                                    </div>


                                    {/* 詳細資訊與位置資訊*/}
                                    <div className="my-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                                        <div className="flex min-h-20 items-center gap-3 rounded-xl bg-gray-50 px-3 py-3 text-gray-700">
                                            <span className="shrink-0 text-blue-600">{InfoIconMap.time?.icon}</span>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500">{zhTWDictionary.pickUpPage.label.time}</p>
                                                <p className="mt-1 font-semibold text-gray-800">
                                                    {formatDateTime(group.start_time).date}・{formatDateTime(group.start_time).time}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex min-h-20 items-center gap-3 rounded-xl bg-gray-50 px-3 py-3 text-gray-700">
                                            <span className="shrink-0 text-blue-600">{InfoIconMap.location?.icon}</span>
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-gray-500">{zhTWDictionary.pickUpPage.label.location}</p>
                                                <p className="mt-1 truncate font-semibold text-gray-800">{group.location?.name || "-"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 展示設施*/}
                                    <div className="mb-5">
                                        <p className="text-sm font-medium text-gray-700 mb-2">{zhTWDictionary.pickUpPage.label.facilities}:</p>

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
                                            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-base font-medium">{zhTWDictionary.pickUpPage.label.level}: {group.skill_level.name || zhTWDictionary.pickUpPage.label.levelNull}</span>
                                            <span className={`px-3 py-1 my-[auto] rounded-md text-base font-bold border ${(group.fee !== 0) ? 'text-green-700 bg-green-50 border-green-200' : 'text-gray-700'}`} >$ {group.fee}</span>

                                        </div>


                                        <div className="flex w-full gap-2 sm:w-auto">
                                            <button
                                                type="button"
                                                onClick={() => openDetailModal(group)}
                                                className="min-h-11 w-2/5 rounded-lg border border-blue-300 px-4 py-2 font-semibold text-blue-600 transition hover:bg-blue-50 sm:w-auto"
                                            >
                                                顯示詳細
                                            </button>

                                            {/* 報名按鈕 */}
                                            <button
                                                disabled={status !== null || isFull}
                                                onClick={() => handleJoinGroup(group.id)}
                                                className={`min-h-11 flex-1 rounded-lg px-6 py-2 font-bold tracking-wide text-white transition sm:flex-none 
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
                                </div>
                            );
                        })}
                    </div>
                </main>

                {/* 臨打團詳細資訊浮動視窗 */}
                {selectedGroup && (
                    <div
                        className={`fixed inset-0 z-[60] flex items-end bg-black/45 p-0 sm:items-center sm:justify-center sm:p-6 transition-opacity duration-300`}
                        role="presentation"
                        onMouseDown={closeDetailModal}
                    >
                        <PickUpDetailPopUp
                            selectedGroup={selectedGroup}
                            handleJoinGroup={handleJoinGroup}
                            closeDetailModal={closeDetailModal}
                            isClosing={isDetailModalClosing}
                            onContactHost={handleContactHost}
                        />
                    </div>
                )}

                {/* 重新載入按鈕 */}
                <button
                    onClick={() => setRefreshTrigger(prev => prev + 1)}
                    className="fixed bottom-4 right-4 z-50 flex items-center justify-center gap-2 bg-gray-700 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                    <div>{functionIconMap.refresh.icon}</div>
                    <span className="font-bold tracking-wider">{zhTWDictionary.pickUpPage.button.refresh}</span>
                </button>

                {/* 申請加入臨打團按鈕 */}
                <button
                    onClick={() => navigate("/external/apply-host")}
                    className="fixed bottom-4 left-4 z-50 flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                    {functionIconMap.add.icon}
                    <span className="font-bold tracking-wider">{zhTWDictionary.pickUpPage.button.hostApply}</span>
                </button>
            </div>
        </div>
    )
}
