import { DayPicker } from "react-day-picker";
import { useState } from "react";
import "./dayPick.css";

function getWeekday(date) {
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"]
  return weekdays[date.getDay()];
}

function Calendar({ onDayPicked = () => { } }) {
  const [selected, setSelected] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const openCalendar = () => {
    setShowCalendar((isOpen) => !isOpen);
  }

  const handleSelect = (date) => {
    setSelected(date);
    if (date && typeof onDayPicked === "function") {
      const weekday = getWeekday(date);
      onDayPicked({
        date,
        weekday,
        formatted: date.toLocaleDateString("zh-TW", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        })
      });
    }
    setShowCalendar(false);
  };

  return (
    <div className="flex flex-col relative">
      <button
        type="button"
        onClick={openCalendar}
        aria-expanded={showCalendar}
        aria-haspopup="dialog"
        className="relative inline-block w-full rounded-lg border border-gray-300 bg-white px-6 py-2 hover:bg-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 sm:w-auto"
      >
        {selected
          ? selected.toLocaleDateString("zh-TW", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
          : "選擇日期"}
      </button>
      <div
        className={`calendar-container ${showCalendar ? 'active' : ''}`}
        style={{
          pointerEvents: showCalendar ? "auto" : "none",
        }}
      >
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          className="day-picker"
        />
      </div>
    </div>


  );
}

export default Calendar;
