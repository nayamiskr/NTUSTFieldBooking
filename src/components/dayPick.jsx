import { DayPicker } from "react-day-picker";
import { useState } from "react";
import "./dayPick.css";

function Calendar() {

    return (
        <DayPicker
            mode="single"
            className="day-picker"
        />
    );
}

export default Calendar;