import { useState, useEffect } from "react";

import Navbar from "../components/navbar";
import Loading from "../../components/loading";
import GroupNearbyMap from "../components/pickUp/pickUpNearbyMap";
import PickUpFilterSection from "../components/pickUp/pickUpFilterSection";
import { formatDateTime } from "../../utils/dateTimeFormat";
import { errorPopup, successPopup } from "../../components/pop-up";
import PickUpDetailPopUp from "../components/pickUp/pickUpDetailPopUp";
import SkillLevelPrompt from "../components/pickUp/SkillLevelPrompt";

import { facilityMap, functionIconMap, InfoIconMap, sportIconMap } from "../../constant/IconMap";
import { statusMap } from "../../constant/statusMap";
import { zhTWDictionary } from "../../locale/zh-TW/translate";
import { pickUpService } from "../../service/pickUpService";
import { skillLevelService } from "../../service/skillLevelService";

const isMissingSkillLevelError = (error) => error?.response?.status === 400
    && /^skill level not set for this sport\b/i.test(String(error?.response?.data?.error || ""));
const HOST_CREATE_URL = "https://vdmin.chenmh.dev/login";


export default function PickUpPage() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("distance");
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [showHostRedirectPrompt, setShowHostRedirectPrompt] = useState(false);
    const [isDetailModalClosing, setIsDetailModalClosing] = useState(false);
    const [levels, setLevels] = useState([]);
    const [myLevelStatus, setMyLevelStatus] = useState("checking");
    const [levelDialogDismissed, setLevelDialogDismissed] = useState(false);
    const [selectedMyLevel, setSelectedMyLevel] = useState("");
    const [savingMyLevel, setSavingMyLevel] = useState(false);
    const [myLevelSaveError, setMyLevelSaveError] = useState("");
    const [levelRange, setLevelRange] = useState(null);
    const [appliedLevelRange, setAppliedLevelRange] = useState(null);
    const [levelsLoading, setLevelsLoading] = useState(true);
    const [levelsError, setLevelsError] = useState("");
    const [levelsRetry, setLevelsRetry] = useState(0);
    const sportTypeId = localStorage.getItem("sportType");

    let userPosition = null;
    try {
        userPosition = JSON.parse(localStorage.getItem("currentPosition") || "null");
    } catch {
        // 尚未定位或快取損壞時，仍可按時間及程度查詢。
    }
    const latitude = userPosition?.lat;
    const longitude = userPosition?.lng;
    const hasPosition = Number.isFinite(latitude) && Number.isFinite(longitude);
    const minSkillLevel = appliedLevelRange?.[0];
    const maxSkillLevel = appliedLevelRange?.[1];

    useEffect(() => {
        let cancelled = false;
        setMyLevelStatus("checking");
        setLevelDialogDismissed(false);
        setSelectedMyLevel("");
        setMyLevelSaveError("");

        skillLevelService.getMyLevel(sportTypeId).then(() => {
            if (!cancelled) setMyLevelStatus("ready");
        }).catch((error) => {
            if (cancelled) return;
            if (isMissingSkillLevelError(error)) {
                setMyLevelStatus("missing");
            } else {
                console.error("取得個人運動程度失敗:", error);
                setMyLevelStatus("error");
                errorPopup("讀取程度失敗", "目前無法確認你的運動程度，請稍後再試。");
            }
        });

        return () => { cancelled = true; };
    }, [sportTypeId]);

    useEffect(() => {
        let cancelled = false;
        setLevelsLoading(true);
        setLoading(true);
        setLevelsError("");
        setLevels([]);
        setLevelRange(null);
        setAppliedLevelRange(null);

        const request = levelsRetry > 0
            ? skillLevelService.refreshSkillLevels(sportTypeId)
            : skillLevelService.getSkillLevels(sportTypeId);
        request.then((data) => {
            if (cancelled) return;
            setLevels(data);
            const initialRange = data.length ? [data[0].level, data[data.length - 1].level] : null;
            setLevelRange(initialRange);
            setAppliedLevelRange(initialRange);
        }).catch((error) => {
            if (cancelled) return;
            console.error("取得程度表失敗:", error);
            setLevelsError("無法載入程度，請重試");
        }).finally(() => {
            if (!cancelled) setLevelsLoading(false);
        });
        return () => { cancelled = true; };
    }, [sportTypeId, levelsRetry]);

    // 拖曳時先更新顯示，停止操作一小段時間後才查詢球團。
    useEffect(() => {
        const timer = window.setTimeout(() => setAppliedLevelRange(levelRange), 350);
        return () => window.clearTimeout(timer);
    }, [levelRange]);

    useEffect(() => {
        if (levelsLoading) return;
        let cancelled = false;
        const fetchGroups = async () => {
            setLoading(true);
            try {
                const data = await pickUpService.getPickUpList({
                    sport_id: sportTypeId,
                    latitude: hasPosition ? latitude : undefined,
                    longitude: hasPosition ? longitude : undefined,
                    sort_by: activeFilter === "distance" && !hasPosition ? "start_time" : activeFilter,
                    sort_order: "asc",
                    min_skill_level: minSkillLevel,
                    max_skill_level: maxSkillLevel,
                });
                if (!cancelled) setGroups(data || []);
            } catch (error) {
                if (cancelled) return;
                console.error("Error fetching groups:", error);
                errorPopup(zhTWDictionary.pickUpPage.errorMessage.error, zhTWDictionary.pickUpPage.errorMessage.fetchFailed);

            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        fetchGroups();
        return () => { cancelled = true; };
    }, [sportTypeId, refreshTrigger, activeFilter, hasPosition, latitude, longitude, minSkillLevel, maxSkillLevel, levelsLoading]);

    const handleJoinGroup = async (groupId) => {
        try {
            await pickUpService.joinPickUpGroup(groupId);
            setGroups((prevGroups) =>
                prevGroups.map((group) => group.id === groupId ? {
                    ...group, enrolledStatus: "pending",
                    current_enrolled: Number(group.current_enrolled || 0) + 1
                } : group)
            );

            successPopup("", zhTWDictionary.pickUpPage.successMessage.registrationSuccess);
            return true;
        } catch (error) {
            errorPopup(zhTWDictionary.pickUpPage.errorMessage.error, zhTWDictionary.pickUpPage.errorMessage.registrationFailed);
            setRefreshTrigger((pre) => pre + 1);
            return false;
        }
    };

    const handleSaveMyLevel = async (event) => {
        event.preventDefault();
        const level = Number(selectedMyLevel);
        if (!levels.some((item) => item.level === level)) {
            setMyLevelSaveError("請先選擇有效的程度。");
            return;
        }

        setSavingMyLevel(true);
        setMyLevelSaveError("");
        try {
            await skillLevelService.setMyLevel(sportTypeId, level);
            setMyLevelStatus("ready");
            successPopup("設定成功", "你的運動程度已儲存。");
        } catch (error) {
            const apiMessage = error?.response?.data?.error;
            setMyLevelSaveError(typeof apiMessage === "string" && apiMessage
                ? apiMessage : "儲存程度失敗，請稍後再試。");
        } finally {
            setSavingMyLevel(false);
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

    return (
        <div>
            <Navbar />
            <h1 className="text-3xl font-bold text-center my-8">{zhTWDictionary.pickUpPage.title}</h1>
            <Loading isLoading={loading || levelsLoading} text={zhTWDictionary.pickUpPage.loadingMessage} />

            {myLevelStatus === "missing" && levelDialogDismissed && (
                <div className="mx-auto mb-4 flex w-[95%] max-w-7xl items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900" role="status">
                    <span>你還沒有設定這個球類的程度。</span>
                    <button type="button" onClick={() => setLevelDialogDismissed(false)} className="shrink-0 font-bold text-blue-700 underline">設定程度</button>
                </div>
            )}
            {myLevelStatus === "missing" && !levelDialogDismissed && !loading && !levelsLoading && (
                <SkillLevelPrompt
                    levels={levels}
                    levelsError={levelsError}
                    value={selectedMyLevel}
                    onChange={(value) => { setSelectedMyLevel(value); setMyLevelSaveError(""); }}
                    onSave={handleSaveMyLevel}
                    onClose={() => setLevelDialogDismissed(true)}
                    onRetry={() => setLevelsRetry((previous) => previous + 1)}
                    saving={savingMyLevel}
                    saveError={myLevelSaveError}
                />
            )}
            <div className="mx-auto mb-8 w-[95%] max-w-7xl lg:flex lg:items-start lg:gap-6">
                <PickUpFilterSection
                    levels={levels}
                    levelRange={levelRange}
                    onLevelChange={setLevelRange}
                    levelsLoading={levelsLoading}
                    levelsError={levelsError}
                    onRetryLevels={() => setLevelsRetry((previous) => previous + 1)}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    selectedDate={selectedDate}
                    onDatePicked={setSelectedDate}
                    onClearDate={() => setSelectedDate(null)}
                />

                <main className="min-w-0 flex-1">
                    <GroupNearbyMap groups={groups} onSelectGroup={openDetailModal} />

                    {/* {顯示臨打團清單} */}
                    {!loading && groups.length === 0 && <p className="text-center text-gray-500">{zhTWDictionary.pickUpPage.groupEmpty}</p>}
                    <div>
                        {groups.filter((group) => {
                            if (!selectedDate) return true;
                            const groupDate = formatDateTime(group.start_time).date;
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
                                            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-base font-medium">{zhTWDictionary.pickUpPage.label.level}: {group.min_skill_level.label || zhTWDictionary.pickUpPage.label.levelNull} {(group.max_skill_level.level == group.min_skill_level.level || !group.max_skill_level.label) ? "" : "- " + group.max_skill_level.label}</span>
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

                {/* 開團入口 */}
                <button
                    type="button"
                    onClick={() => setShowHostRedirectPrompt(true)}
                    className="fixed bottom-4 left-4 z-50 flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                    {functionIconMap.add.icon}
                    <span className="font-bold tracking-wider">{zhTWDictionary.pickUpPage.button.hostApply}</span>
                </button>

                {showHostRedirectPrompt && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 px-4 py-6">
                        <div role="dialog" aria-modal="true" aria-labelledby="host-redirect-title" aria-describedby="host-redirect-description" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 id="host-redirect-title" className="text-xl font-bold text-slate-900">前往新增臨打團</h2>
                                    <p id="host-redirect-description" className="mt-2 text-sm leading-6 text-slate-600">目前將前往新增臨打團的頁面。</p>
                                </div>
                                <button type="button" onClick={() => setShowHostRedirectPrompt(false)} aria-label="關閉提示" className="rounded-lg px-2 py-1 text-xl text-slate-500 hover:bg-slate-100">×</button>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowHostRedirectPrompt(false)} className="rounded-lg border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50">取消</button>
                                <a href={HOST_CREATE_URL} className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700">前往</a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
