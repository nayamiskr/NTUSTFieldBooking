import { DayPicker } from "react-day-picker";
import { zhTW } from "react-day-picker/locale";
import { useState } from "react";
import "react-day-picker/style.css";
import "./dayPick.css";

function getWeekday(date) {
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"]
  return weekdays[date.getDay()];
}

function Calendar({
  onDayPicked = () => {},
  buttonId,
  placeholder = "選擇日期",
  showYearDropdown = false,
  maxDate,
}) {
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
    <div className={`flex flex-col relative ${showYearDropdown ? "calendar-birth" : ""}`}>
      <button
        id={buttonId}
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
          : placeholder}
      </button>
      <div
        className={`calendar-container ${showCalendar ? 'active' : ''} ${showYearDropdown ? 'calendar-container--birth' : ''}`}
        style={{
          pointerEvents: showCalendar ? "auto" : "none",
        }}
      >
        <DayPicker
          mode="single"
          required={showYearDropdown}
          selected={selected}
          onSelect={handleSelect}
          className={`day-picker ${showYearDropdown ? "day-picker--birth" : ""}`}
          captionLayout={showYearDropdown ? "dropdown" : undefined}
          reverseYears={showYearDropdown}
          startMonth={showYearDropdown ? new Date(1900, 0) : undefined}
          endMonth={showYearDropdown ? maxDate || new Date() : undefined}
          defaultMonth={showYearDropdown ? new Date(new Date().getFullYear() - 20, new Date().getMonth()) : undefined}
          disabled={maxDate ? { after: maxDate } : undefined}
          locale={showYearDropdown ? zhTW : undefined}
        />
      </div>
    </div>


  );
}

export default Calendar;
