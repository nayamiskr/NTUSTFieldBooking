import { DayPicker } from "react-day-picker";
import { useState } from "react";
import "./dayPick.css";

function Calendar() {
    const [selected, setSelected] = useState();

    return (
        <DayPicker
            mode="single"
            selected={selected}
            onSelect={setSelected}
            className="day-picker"
            disabled={[
                new Date(2025, 7, 1), // 精準日期
                new Date(2025, 7, 18), // 精準日期
            ]}
        />
    );
}

export default Calendar;