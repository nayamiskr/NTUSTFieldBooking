import { DayPicker } from "react-day-picker";
import { useState } from "react";
import "./dayPick.css";

function getWeekday(date) {
  const weekdays = ["週一", "週二", "週三", "週四", "週五", "週六", "週日"]
  return weekdays[date.getDay()];
}

function Calendar({ onDayPicked = () => {} }) {
  const [selected, setSelected] = useState();

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