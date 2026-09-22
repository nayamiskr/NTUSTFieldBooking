import { statusMap } from "../../../constant/statusMap";
import { formatDateTime } from "../../../utils/dateTimeFormat";
import { facilityMap, functionIconMap, InfoIconMap, sportIconMap } from "../../../constant/IconMap";

export default function PickUpDetailPopUp({ selectedGroup, handleJoinGroup, closeDetailModal, isClosing, onContactHost }) {
    const isFull = Number(selectedGroup.current_enrolled || 0) >= Number(selectedGroup.capacity || 0);
    const status = selectedGroup.enrolledStatus;
    const canJoin = status === null && !isFull;
    const detailNote = selectedGroup.description || "主揪尚未提供額外備註。";
    const hasParking = selectedGroup.facilities?.includes("parking");
    const parkingDetail = selectedGroup.location?.parking_info
        || selectedGroup.location?.parking_detail
        || (typeof selectedGroup.location?.parking === "string" ? selectedGroup.location.parking : null)
        || (hasParking ? "停車場" : "場地未提供停車資訊。");
    const host = selectedGroup.host || {};
    const hostName = host.display_name || host.username || "未提供主揪資訊";
    const hostUsername = host.username || "未提供 username";
    const hostAvatar = host.avatar_thumbnail || host.avatar;
    const canContactHost = Boolean(host.contact_url || host.line_url || host.lineUrl || host.email || host.phone);
    const latitude = selectedGroup.location?.latitude;
    const longitude = selectedGroup.location?.longitude;
    const hasCoordinates = latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined;

    const openLocationInGoogleMaps = () => {
        if (!hasCoordinates) return;

        const query = encodeURIComponent(`${latitude},${longitude}`);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank", "noopener,noreferrer");
    };

    return (
        <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="pickup-detail-title"
            className={`max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl ${isClosing ? "pickup-modal-panel-leave" : "pickup-modal-panel-enter"}`}
            onMouseDown={(event) => event.stopPropagation()}
        >
            <div className="sticky top-0 flex items-start justify-between border-b border-gray-100 bg-white px-5 py-3 sm:px-7">
                <div className="min-w-0">
                    <h2 id="pickup-detail-title" className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
                        {selectedGroup.title}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                        <span className="flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
                            <span className="text-base">{sportIconMap[selectedGroup.sport?.code]?.icon}</span>
                            {selectedGroup.sport?.name || "臨打團"}
                        </span>
                        <span className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold ${isFull ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-700"}`}>
                            <span className="text-base">{InfoIconMap.host?.icon}</span>
                            {selectedGroup.current_enrolled || 0}/{selectedGroup.capacity || 0} 人
                        </span>
                    </div>
                </div>
                <button
                    type="button"
                    aria-label="關閉詳細資訊"
                    onClick={closeDetailModal}
                    className="ml-4 grid h-10 w-10 shrink-0 place-items-center rounded-full text-2xl leading-none text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                >
                    <div>
                        {functionIconMap.cancel.icon}
                    </div>
                </button>
            </div>

            <div className="space-y-4 px-5 py-4 sm:px-7">
                <section aria-label="場次摘要" className="space-y-3">
                    <div className="rounded-2xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                                    <span className="text-lg">{InfoIconMap.time?.icon}</span>
                                    活動時間
                                </p>
                                <p className="mt-1 text-lg font-bold text-gray-900">{formatDateTime(selectedGroup.start_time).date}</p>
                            </div>
                            <div className="grid w-full grid-cols-2 overflow-hidden rounded-xl shadow-sm sm:w-[58%]">
                                <div className="px-3 py-2.5">
                                    <p className="text-xs text-blue-700">開始時間</p>
                                    <p className="mt-0.5 font-bold">{formatDateTime(selectedGroup.start_time).time}</p>
                                </div>
                                <div className="border-l border-gray-300 px-3 py-2.5">
                                    <p className="text-xs text-blue-700">結束時間</p>
                                    <p className="mt-0.5 font-bold">{formatDateTime(selectedGroup.end_time).time}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            disabled={!hasCoordinates}
                            title={hasCoordinates ? "在 Google Maps 開啟位置" : "此場地尚未提供座標"}
                            onClick={openLocationInGoogleMaps}
                            className={`rounded-xl border px-4 py-3 text-left shadow-sm transition ${hasCoordinates
                                ? "border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                : "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400"
                                }`}
                        >
                            <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                                <span className="text-lg text-blue-600">{InfoIconMap.location?.icon}</span>
                                地點
                            </p>
                            <p className="mt-1 truncate font-semibold text-gray-900">{selectedGroup.location?.name || "尚未提供"}</p>
                            {selectedGroup.location?.address && (
                                <p className="mt-1 truncate text-xs text-gray-500">{selectedGroup.location.address}</p>
                            )}
                            {hasCoordinates && <p className="mt-2 text-xs font-semibold text-blue-600">點擊查看地圖 →</p>}
                        </button>
                        <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                            <p className="text-xs font-semibold text-gray-500">程度與費用</p>
                            <p className="mt-1 font-semibold text-gray-900">{selectedGroup.skill_level?.name || "不限程度"}</p>
                            <p className="mt-2 inline-flex rounded-md border border-green-200 bg-green-50 px-2.5 py-1 text-sm font-bold text-green-700">
                                $ {selectedGroup.fee || 0}
                            </p>
                        </div>
                    </div>
                </section>

                <section aria-label="主揪資訊" className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <h3 className="font-bold text-gray-900">主揪資訊</h3>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                        <div className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-blue-100 font-bold text-blue-700">
                            {hostName.charAt(0)}
                            {hostAvatar && (
                                <img
                                    src={hostAvatar}
                                    alt={`${hostName} 的頭像`}
                                    onError={(event) => { event.currentTarget.style.display = "none"; }}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-gray-900">{hostName}</p>
                            <p className="mt-0.5 truncate text-sm text-gray-500">@{hostUsername}</p>
                        </div>
                        <button
                            type="button"
                            disabled={!canContactHost}
                            title={canContactHost ? "聯絡主揪" : "主揪尚未提供聯絡方式"}
                            onClick={() => onContactHost(host)}
                            className={`min-h-10 shrink-0 rounded-lg px-3 text-sm font-bold transition ${canContactHost
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "cursor-not-allowed bg-gray-100 text-gray-400"
                                }`}
                        >
                            聯絡主揪
                        </button>
                    </div>
                </section>

                <div>
                    <h3 className="font-bold text-gray-900">場地設施</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {selectedGroup.facilities?.length ? selectedGroup.facilities.map((facilityKey) => {
                            const facility = facilityMap[facilityKey];
                            return (
                                <span key={facilityKey} className="flex w-[76px] flex-col items-center justify-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-2 text-gray-700">
                                    <span className="text-xl">{facility?.icon}</span>
                                    <span className="text-xs font-medium">{facility?.name || facilityKey}</span>
                                </span>
                            );
                        }) : <span className="text-sm text-gray-500">尚未提供設施資訊</span>}
                    </div>
                </div>

                <div className="rounded-xl border border-blue-100  px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                        <span className="text-blue-700">{facilityMap.parking.icon}</span>
                        停車資訊
                    </div>
                    <p className="mt-1 text-sm leading-5 text-gray-700">{parkingDetail}</p>
                </div>

                <div>
                    <h3 className="font-bold text-gray-900">主揪備註</h3>
                    <p className="mt-2 whitespace-pre-wrap rounded-xl   py-3 text-sm leading-5 text-gray-700">{detailNote}</p>
                </div>
            </div>

            <div className="sticky bottom-0 flex gap-3 border-t border-gray-100 bg-white px-5 py-3 sm:px-7">
                <button
                    type="button"
                    onClick={closeDetailModal}
                    className="min-h-11 flex-1 rounded-lg border border-gray-300 px-4 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                    關閉
                </button>
                <button
                    type="button"
                    disabled={!canJoin}
                    onClick={async () => {
                        const joined = await handleJoinGroup(selectedGroup.id);
                        if (joined) closeDetailModal();
                    }}
                    className={`min-h-11 flex-1 rounded-lg px-4 font-bold text-white transition ${!canJoin ? "cursor-not-allowed opacity-60" : "hover:opacity-90"} ${isFull && status === null ? statusMap.full.class : (statusMap[status]?.class || statusMap.default.class)}`}
                >
                    {status !== null
                        ? (statusMap[status]?.label || statusMap.default.label)
                        : isFull
                            ? statusMap.full.label
                            : statusMap.default.label}
                </button>
            </div>
        </section>
    )
}
