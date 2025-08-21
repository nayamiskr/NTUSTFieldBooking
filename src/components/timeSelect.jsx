import React, { useState } from 'react';
import './timeSelect.css';

const OPEN_HOUR = 8;  
const CLOSE_HOUR = 22; 
const HOURS = Array.from({ length: CLOSE_HOUR - OPEN_HOUR }, (_, i) => OPEN_HOUR + i);

const DAYS = ["週一", "週二", "週三", "週四", "週五", "週六", "週日"];

const RESERVED_BOOKINGS = [
  { start: 17, end: 20, title: "校隊訓練" },
];

const EN2ZH = {
  Sunday: "週日",
  Monday: "週一",
  Tuesday: "週二",
  Wednesday: "週三",
  Thursday: "週四",
  Friday: "週五",
  Saturday: "週六",
};

const ZH_XQ = {
  "星期一": "週一",
  "星期二": "週二",
  "星期三": "週三",
  "星期四": "週四",
  "星期五": "週五",
  "星期六": "週六",
  "星期日": "週日",
  "星期天": "週日",
};

function normalizeWeekday(input) {
  if (input == null) return null;
  if (typeof input === "number") {
    // JS getDay(): 0=Sunday ... 6=Saturday
    const map = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];
    return map[input] ?? null;
  }
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (DAYS.includes(trimmed)) return trimmed; // already zh label like "週一"
    if (EN2ZH[trimmed]) return EN2ZH[trimmed]; // English name
    if (ZH_XQ[trimmed]) return ZH_XQ[trimmed]; // Chinese "星期X"
  }
  return null;
}

function formatSlotLabel(h) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:00—${pad(h + 1)}:00`;
}

function TimeSelect({ selectedWeekday = null, lockedDay, hideOtherDays = true, autoHighlightLockedBooked = false }) {
  const effectiveLockedDay = normalizeWeekday(selectedWeekday) || lockedDay;
  const [selected, setSelected] = useState(new Set());
  return (
    <div style={{ width: "100%" }}>
      

      <table className="time-grid">
        <thead>
          <tr>
            <th></th>
            {DAYS.map((d) => (
              <th key={d}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HOURS.map((h) => (
            <tr key={h}>
              <th>{formatSlotLabel(h)}</th>
              {DAYS.map((d) => {
                const demo = RESERVED_BOOKINGS.some((b) => h >= b.start && h < b.end);
                const key = `${d}-${h}`;
                const isSelected = selected.has(key);
                const toggle = () => {
                  setSelected((prev) => {
                    const next = new Set(prev);
                    if (next.has(key)) next.delete(key);
                    else next.add(key);
                    return next;
                  });
                };
                const isLockedDay = d === effectiveLockedDay;
                return (
                  <td
                    key={key}
                    className={`slot${isLockedDay ? " locked" : ""}`}
                    data-day={d}
                    data-hour={h}
                    data-demo={demo ? "true" : undefined}
                    data-selected={isSelected ? "true" : undefined}
                    title={`${d} ${formatSlotLabel(h)}`}
                  >
                    {demo && (
                      <div className="badge">
                        {RESERVED_BOOKINGS.find((b) => h >= b.start && h < b.end)?.title}
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