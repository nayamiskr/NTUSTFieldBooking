import React, { useState } from 'react';
import './timeSelect.css';

const OPEN_HOUR = 8;  
const CLOSE_HOUR = 22; 
const HOURS = Array.from({ length: CLOSE_HOUR - OPEN_HOUR }, (_, i) => OPEN_HOUR + i);

const DAYS = [ "週日", "週一", "週二", "週三", "週四", "週五", "週六"];

const RESERVED_BOOKINGS = [
  { day: "週二", start: 17, end: 20, title: "校隊訓練" },
  { day: "週五", start: 13, end: 16, title: "校隊訓練" },
];

function formatSlotLabel(h) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:00—${pad(h + 1)}:00`;
}

function isInSelectedRange(day, hour, selectedRange) {
  if (!selectedRange) return false;
  if (day !== selectedRange.day) return false;
  return hour >= selectedRange.start && hour < selectedRange.end;
}

function TimeSelect({lockedDay}) {
  const [selectedRange, setSelectedRange] = useState(null);

  const lockedIdx = DAYS.indexOf(lockedDay);
  const visibleDays = lockedIdx >= 0
    ? [DAYS[(lockedIdx + 6) % 7], DAYS[lockedIdx], DAYS[(lockedIdx + 1) % 7]]
    : DAYS.slice(0, 3); 

  const handleSlotClick = (day, hour) => {
    if (!selectedRange) {
      setSelectedRange({ day, start: hour, end: hour + 1 });
      console.log('range =>', {day, start: hour, end: hour + 1});
    } else {
      if (day === selectedRange.day) {
        if (hour >= selectedRange.start) {
          setSelectedRange({ day, start: selectedRange.start, end: hour + 1 });
          console.log('range =>', { day: selectedRange.day, start: Math.min(selectedRange.start, hour), end: Math.max(selectedRange.end, hour + 1) });
        } else {
          setSelectedRange({ day, start: hour, end: selectedRange.end });
          console.log('range =>', { day: selectedRange.day, start: Math.min(selectedRange.start, hour), end: Math.max(selectedRange.end, hour + 1) });
        }
      } else {
        setSelectedRange({ day, start: hour, end: hour + 1 });
        console.log('range =>', {day, start: hour, end: hour + 1});
      }
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <table className="time-grid">
        <thead>
          <tr>
            <th></th>
            {visibleDays.map((d) => (
              <th key={d}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HOURS.map((h) => (
            <tr key={h}>
              <th>{formatSlotLabel(h)}</th>
              {visibleDays.map((d) => {
                const demo = RESERVED_BOOKINGS.some((b) => d === b.day && h >= b.start && h < b.end);
                const key = `${d}-${h}`;
                const isSelected = isInSelectedRange(d, h, selectedRange);
                const isLockedDay = d === lockedDay;
                const inSelectedRange = isInSelectedRange(d, h, selectedRange);
                return (
                  <td
                    key={key}
                    className={`slot${isLockedDay ? " locked" : ""}${inSelectedRange ? " selected-range" : ""}`}
                    data-day={d}
                    data-hour={h}
                    data-demo={demo ? "true" : undefined}
                    data-selected={isSelected ? "true" : undefined}
                    title={`${d} ${formatSlotLabel(h)}`}
                    onClick={() => handleSlotClick(d, h)}
                  >
                    {demo && (
                      <div className="badge">
                        {RESERVED_BOOKINGS.find((b) => d === b.day && h >= b.start && h < b.end)?.title}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TimeSelect;