import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { UserPage } from "./UserPage";
import { getUserProfile, updateUserProfile } from "../../service/userService";

jest.mock("react-day-picker", () => {
    const React = require("react");
    return {
        DayPicker: ({ onSelect }) => React.createElement("button", {
            type: "button",
            onClick: () => onSelect(new Date(1999, 8, 15)),
        }, "選擇 1999/09/15"),
    };
});
jest.mock("react-day-picker/locale", () => ({ zhTW: {} }));
jest.mock("react-day-picker/style.css", () => ({}), { virtual: true });
jest.mock("../components/navbar", () => () => null);
jest.mock("../../components/loading", () => () => null);
jest.mock("../../components/pop-up", () => ({ errorPopup: jest.fn(), successPopup: jest.fn() }));
jest.mock("../../service/userService", () => ({
    getUserProfile: jest.fn(),
    updateUserProfile: jest.fn(),
}));

test("shows birthday and saves birthday through the API while keeping the mock level local", async () => {
    localStorage.clear();
    getUserProfile.mockResolvedValue({
        id: 42,
        username: "player42",
        display_name: "球友",
        email: "player@example.com",
        phone: "",
        gender: "male",
        birth_date: "2000-05-10",
    });
    updateUserProfile.mockResolvedValue({ user: {} });

    render(<UserPage />);

    expect(await screen.findByText("2000年5月10日")).toBeTruthy();
    expect(screen.getByText("初級")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "編輯資料" }));
    fireEvent.click(screen.getByRole("button", { name: "出生日期" }));
    fireEvent.click(screen.getByRole("button", { name: "選擇 1999/09/15" }));
    fireEvent.change(screen.getByLabelText("程度（示範）"), { target: { value: "中級" } });
    fireEvent.click(screen.getByRole("button", { name: "儲存變更" }));

    await waitFor(() => expect(updateUserProfile).toHaveBeenCalledWith({
        display_name: "球友",
        phone: "",
        gender: "male",
        birth_date: "1999-09-15",
    }));
    await screen.findByText("1999年9月15日");
    expect(screen.getByText("中級")).toBeTruthy();
    expect(localStorage.getItem("profile-mock-level:42")).toBe("中級");
});
