import { statusMap } from "../../../constant/statusMap";
import { formatDateTime } from "../../../utils/dateTimeFormat";
import { facilityMap } from "../../../constant/IconMap";

export default function PickUpDetailPopUp({ selectedGroup, handleJoinGroup, closeDetailModal, isClosing }) {
    const isFull = Number(selectedGroup.current_enrolled || 0) >= Number(selectedGroup.capacity || 0);
    const status = selectedGroup.enrolledStatus;
    const canJoin = status === null && !isFull;
    const detailNote = selectedGroup.description || "主揪尚未提供額外備註。";

    return (
        <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="pickup-detail-title"
            className={`max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl ${isClosing ? "pickup-modal-panel-leave" : "pickup-modal-panel-enter"}`}
            onMouseDown={(event) => event.stopPropagation()}
        >
            <div className="sticky top-0 flex items-start justify-between border-b border-gray-100 bg-white px-5 py-4 sm:px-7">
                <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                            {selectedGroup.sport?.name || "臨打團"}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${isFull ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-700"}`}>
                            {selectedGroup.current_enrolled || 0}/{selectedGroup.capacity || 0} 人
                        </span>
                    </div>
                    <h2 id="pickup-detail-title" className="text-xl font-bold text-gray-900 sm:text-2xl">
                        {selectedGroup.title}
                    </h2>
                </div>
                <button
                    type="button"
                    aria-label="關閉詳細資訊"
                    onClick={closeDetailModal}
                    className="ml-4 grid h-10 w-10 shrink-0 place-items-center rounded-full text-2xl leading-none text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                >
                    ×
                </button>
            </div>

            <div className="space-y-6 px-5 py-6 sm:px-7">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-gray-50 p-4">
                        <p className="text-sm text-gray-500">時間</p>
                        <p className="mt-1 font-semibold text-gray-900">
                            {formatDateTime(selectedGroup.start_time).date}・{formatDateTime(selectedGroup.start_time).time}
                        </p>
                        {selectedGroup.end_time && (
                            <p className="mt-1 text-sm text-gray-600">至 {formatDateTime(selectedGroup.end_time).time}</p>
                        )}
                    </div>
                    <div className="rounded-xl bg-gray-50 p-4">
                        <p className="text-sm text-gray-500">地點</p>
                        <p className="mt-1 font-semibold text-gray-900">{selectedGroup.location?.name || "尚未提供"}</p>
                        {selectedGroup.location?.address && (
                            <p className="mt-1 text-sm text-gray-600">{selectedGroup.location.address}</p>
                        )}
                    </div>
                    <div className="rounded-xl bg-gray-50 p-4">
                        <p className="text-sm text-gray-500">程度與費用</p>
                        <p className="mt-1 font-semibold text-gray-900">{selectedGroup.skill_level?.name || "不限程度"}</p>
                        <p className="mt-1 text-sm text-gray-600">費用：$ {selectedGroup.fee || 0}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-4">
                        <p className="text-sm text-gray-500">主揪</p>
                        <p className="mt-1 font-semibold text-gray-900">{selectedGroup.host?.display_name || "未提供"}</p>
                        <p className="mt-1 text-sm text-gray-600">目前 {selectedGroup.current_enrolled || 0} 人已報名</p>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-gray-900">場地設施</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {selectedGroup.facilities?.length ? selectedGroup.facilities.map((facilityKey) => {
                            const facility = facilityMap[facilityKey];
                            return (
                                <span key={facilityKey} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                                    {facility?.icon} {facility?.name || facilityKey}
                                </span>
                            );
                        }) : <span className="text-sm text-gray-500">尚未提供設施資訊</span>}
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-gray-900">主揪備註</h3>
                    <p className="mt-2 whitespace-pre-wrap rounded-xl bg-blue-50 px-4 py-3 text-sm leading-6 text-gray-700">{detailNote}</p>
                </div>
            </div>

            <div className="sticky bottom-0 flex gap-3 border-t border-gray-100 bg-white px-5 py-4 sm:px-7">
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
