import { useState } from "react";
import Calendar from "../../../components/dayPicker/dayPick";
import { functionIconMap } from "../../../constant/IconMap";
import { DoubleSlide } from "../../../components/rangeSlide";

const sortOptions = [
    { value: "distance", label: "距離近" },
    { value: "start_time", label: "快開始" },
];

function FilterContent({ activeFilter, onFilterChange, selectedDate, onDatePicked, onClearDate, isMobile, onClose,
    levels, levelRange, onLevelChange, levelsLoading, levelsError, onRetryLevels }) {
    const handleDatePicked = (day) => {
        onDatePicked(day.date);
        if (isMobile) onClose();
    };

    const handleFilterChange = (filter) => {
        onFilterChange(filter);
        if (isMobile) onClose();
    };

    return (
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
                <p className="text-lg font-bold text-gray-900">篩選球團</p>
                {isMobile && (
                    <button
                        type="button"
                        onClick={onClose}
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
                        {sortOptions.map((option) => (
                            <button
                                type="button"
                                key={option.value}
                                onClick={() => handleFilterChange(option.value)}
                                className={`flex-1 rounded-md px-3 py-2 text-sm font-bold transition-all ${activeFilter === option.value
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold tracking-wider text-gray-500">選擇日期</label>
                    <div className="flex items-center gap-2">
                        <Calendar selectedDate={selectedDate} onDayPicked={handleDatePicked} />
                        <button
                            type="button"
                            onClick={onClearDate}
                            className="rounded-lg border border-red-100 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                            清除
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-xs font-bold tracking-wider text-gray-500">篩選程度</p>
                    {levelsLoading ? <p className="text-sm text-slate-500">載入程度中…</p>
                        : levelsError ? <div className="text-sm text-red-600" role="status">
                            <p>{levelsError}</p>
                            <button type="button" onClick={onRetryLevels} className="mt-2 text-blue-600 underline">重新載入</button>
                        </div>
                        : levels.length > 0 && levelRange ? <>
                            <DoubleSlide value={levelRange} onChange={onLevelChange} levels={levels} />
                            {levels.length > 1 && <div aria-hidden="true" className="relative mx-3 h-4 text-xs tabular-nums text-slate-400">
                                <span className="absolute left-0 -translate-x-1/2">{levels[0].label}</span>
                                <span className="absolute right-0 translate-x-1/2">{levels[levels.length - 1].label}</span>
                            </div>}
                        </> : <p className="text-sm text-slate-500">此球類尚未設定程度</p>}
                </div>
            </div>
        </section>
    );
}

export default function PickUpFilterSection({ activeFilter, onFilterChange, selectedDate, onDatePicked, onClearDate,
    levels, levelRange, onLevelChange, levelsLoading, levelsError, onRetryLevels }) {
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const levelProps = { levels, levelRange, onLevelChange, levelsLoading, levelsError, onRetryLevels };

    return (
        <>
            <aside className="sticky top-4 hidden w-72 shrink-0 lg:block z-10">
                <FilterContent
                    {...levelProps}
                    activeFilter={activeFilter}
                    onFilterChange={onFilterChange}
                    selectedDate={selectedDate}
                    onDatePicked={onDatePicked}
                    onClearDate={onClearDate}
                />
            </aside>

            <div className="mb-4 lg:hidden">
                <button
                    type="button"
                    aria-expanded={isMobileFilterOpen}
                    aria-controls="mobile-pickup-filters"
                    onClick={() => setIsMobileFilterOpen((isOpen) => !isOpen)}
                    className="ml-auto grid h-11 w-11 place-items-center rounded-lg border border-blue-200 bg-white text-blue-700 shadow-sm transition-opacity duration-300 hover:bg-blue-50"
                >
                    {functionIconMap.filter.icon}
                </button>

                <div
                    id="mobile-pickup-filters"
                    className={`relative z-20 grid transition-[grid-template-rows,opacity,transform] duration-500 ease-out-in ${isMobileFilterOpen
                        ? "grid-rows-[1fr] translate-y-2 overflow-visible opacity-100"
                        : "grid-rows-[0fr] translate-y-2 overflow-hidden opacity-0 pointer-events-none"
                        }`}
                >
                    <div className={isMobileFilterOpen ? "overflow-visible" : "overflow-hidden"}>
                        <FilterContent
                            {...levelProps}
                            activeFilter={activeFilter}
                            onFilterChange={onFilterChange}
                            selectedDate={selectedDate}
                            onDatePicked={onDatePicked}
                            onClearDate={onClearDate}
                            isMobile
                            onClose={() => setIsMobileFilterOpen(false)}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
