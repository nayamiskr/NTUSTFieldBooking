import { DayPicker } from "react-day-picker";
import { useState } from "react";
import "./dayPick.css";

function getWeekday(date) {
  const weekdays = ["週一", "週二", "週三", "週四", "週五", "週六", "週日"]
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
            new Date(2025, 7, 1),
            new Date(2025, 7, 18),
          ]}
        />
      </div>

    </div>


  );
}

export default Calendar;