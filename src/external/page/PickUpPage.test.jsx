import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StrictMode } from "react";

import PickUpPage from "./PickUpPage";
import { pickUpService } from "../../service/pickUpService";
import { skillLevelService } from "../../service/skillLevelService";
import { errorPopup } from "../../components/pop-up";

jest.mock("../components/navbar", () => () => null);
jest.mock("../../components/loading", () => () => null);
jest.mock("../components/pickUp/pickUpNearbyMap", () => () => null);
jest.mock("../components/pickUp/pickUpFilterSection", () => () => null);
jest.mock("../components/pickUp/pickUpDetailPopUp", () => () => null);
jest.mock("../../components/pop-up", () => ({ errorPopup: jest.fn(), successPopup: jest.fn() }));
jest.mock("../../service/pickUpService", () => ({
    pickUpService: { getPickUpList: jest.fn() },
}));
jest.mock("../../service/skillLevelService", () => ({
    skillLevelService: { getSkillLevels: jest.fn(), refreshSkillLevels: jest.fn(), getMyLevel: jest.fn(), setMyLevel: jest.fn() },
}));
jest.mock("react-router-dom", () => ({ useNavigate: () => jest.fn() }), { virtual: true });

beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    skillLevelService.getMyLevel.mockResolvedValue({ level: 1 });
});

test("loads the group list once with the initialized skill range", async () => {
    localStorage.setItem("sportType", "1");
    let resolveLevels;
    skillLevelService.getSkillLevels.mockReturnValue(new Promise((resolve) => {
        resolveLevels = resolve;
    }));
    pickUpService.getPickUpList.mockResolvedValue([]);

    render(<StrictMode><PickUpPage /></StrictMode>);
    expect(pickUpService.getPickUpList).not.toHaveBeenCalled();

    await act(async () => {
        resolveLevels([{ level: 1, label: "初級" }, { level: 3, label: "進階" }]);
    });

    await waitFor(() => expect(pickUpService.getPickUpList).toHaveBeenCalledTimes(1));
    expect(pickUpService.getPickUpList).toHaveBeenCalledWith(expect.objectContaining({
        sport_id: "1",
        min_skill_level: 1,
        max_skill_level: 3,
    }));
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 400));
    });
    expect(pickUpService.getPickUpList).toHaveBeenCalledTimes(1);
});

test("offers a level picker for the specific missing-level 400 and saves the choice", async () => {
    localStorage.setItem("sportType", "1");
    skillLevelService.getMyLevel.mockRejectedValue({
        response: { status: 400, data: { error: "skill level not set for this sport; set it via PUT /me/skill-levels/{sport_id}" } },
    });
    skillLevelService.getSkillLevels.mockResolvedValue([{ level: 1, label: "初級" }, { level: 3, label: "進階" }]);
    skillLevelService.setMyLevel.mockResolvedValue({});
    pickUpService.getPickUpList.mockResolvedValue([]);

    render(<StrictMode><PickUpPage /></StrictMode>);
    expect(await screen.findByRole("dialog", { name: "設定你的運動程度" })).toBeTruthy();

    fireEvent.change(screen.getByLabelText("我的程度"), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "儲存程度" }));

    await waitFor(() => expect(skillLevelService.setMyLevel).toHaveBeenCalledWith("1", 3));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "設定你的運動程度" })).toBeNull());
});

test("keeps the level picker open and shows the API error when saving fails", async () => {
    localStorage.setItem("sportType", "1");
    skillLevelService.getMyLevel.mockRejectedValue({
        response: { status: 400, data: { error: "skill level not set for this sport" } },
    });
    skillLevelService.getSkillLevels.mockResolvedValue([{ level: 1, label: "初級" }]);
    skillLevelService.setMyLevel.mockRejectedValue({
        response: { status: 400, data: { error: "無效的程度" } },
    });
    pickUpService.getPickUpList.mockResolvedValue([]);

    render(<PickUpPage />);
    await screen.findByRole("dialog", { name: "設定你的運動程度" });
    fireEvent.change(screen.getByLabelText("我的程度"), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: "儲存程度" }));

    expect(await screen.findByRole("alert")).toHaveProperty("textContent", "無效的程度");
    expect(screen.getByRole("dialog", { name: "設定你的運動程度" })).toBeTruthy();
});

test("does not treat an unrelated 400 as an unset skill level", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    localStorage.setItem("sportType", "1");
    skillLevelService.getMyLevel.mockRejectedValue({
        response: { status: 400, data: { error: "invalid sport id" } },
    });
    skillLevelService.getSkillLevels.mockResolvedValue([]);
    pickUpService.getPickUpList.mockResolvedValue([]);

    render(<PickUpPage />);
    await waitFor(() => expect(errorPopup).toHaveBeenCalledWith("讀取程度失敗", expect.any(String)));
    expect(screen.queryByRole("dialog", { name: "設定你的運動程度" })).toBeNull();
    consoleError.mockRestore();
});
