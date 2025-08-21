import { DayPicker } from "react-day-picker";
import { useState } from "react";
import "./dayPick.css";

function getWeekday(date) {
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return weekdays[date.getDay()];
}

function Calendar({ onDayPicked = () => {} }) {
  const [selected, setSelected] = useState();

  const handleSelect = (date) => {
    setSelected(date);
    if (date && typeof onDayPicked === "function") {
      const weekday = getWeekday(date);
      onDayPicked(weekday);
    }
  };

  return (
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
  );
}

export default Calendar;