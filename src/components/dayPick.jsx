import { DayPicker } from "react-day-picker";
import { useState } from "react";
import "./dayPick.css";

function getWeekday(date) {
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"]
  return weekdays[date.getDay()];
}

function Calendar({ onDayPicked = () => { } }) {
  const [selected, setSelected] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const openCalendar = () => {
    setShowCalendar(!showCalendar);
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
    <div>
      <button onClick={openCalendar} className="calendar-button">
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
          disabled={[
            new Date(2026, 1, 20),
            new Date(2025, 7, 18),
          ]}//這邊可以放哪天不行
        />
      </div>

    </div>


  );
}

export default Calendar;