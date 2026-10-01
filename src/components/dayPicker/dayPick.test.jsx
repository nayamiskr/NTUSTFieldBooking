import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";

import Calendar from "./dayPick";

jest.mock("react-day-picker", () => {
    const React = require("react");
    return {
        DayPicker: ({ onSelect }) => React.createElement("button", {
            type: "button",
            onClick: () => onSelect(new Date(2000, 4, 15)),
        }, "選擇 2000/05/15"),
    };
});
jest.mock("react-day-picker/locale", () => ({ zhTW: {} }));
jest.mock("react-day-picker/style.css", () => ({}), { virtual: true });

function CalendarWithClear() {
    const [selectedDate, setSelectedDate] = useState(new Date(2000, 4, 10));
    return (
        <>
            <Calendar selectedDate={selectedDate} onDayPicked={({ date }) => setSelectedDate(date)} />
            <button type="button" onClick={() => setSelectedDate(null)}>清除</button>
        </>
    );
}

test("clearing the parent date also clears the Calendar button", () => {
    render(<CalendarWithClear />);
    expect(screen.getByRole("button", { name: "2000/05/10" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "2000/05/10" }));
    fireEvent.click(screen.getByRole("button", { name: "選擇 2000/05/15" }));
    expect(screen.getByRole("button", { name: "2000/05/15" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "清除" }));
    expect(screen.getByRole("button", { name: "選擇日期" })).toBeTruthy();
});
