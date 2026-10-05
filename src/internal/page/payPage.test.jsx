import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import PayPage from "./payPage";
import api from "../../baseApi";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useLocation: () => ({ state: {
    fieldName: "羽球館",
    resourceId: "court-1",
    date: "2026/10/7",
    timeRange: "18:00 - 20:00",
  } }),
  useNavigate: () => mockNavigate,
}), { virtual: true });
jest.mock("../../baseApi", () => ({ post: jest.fn() }));

test("internal booking uses the same Z timestamp format", async () => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(window, "alert").mockImplementation(() => {});
  api.post.mockResolvedValue({ data: { id: "booking-1" } });

  render(<PayPage />);
  fireEvent.click(screen.getByRole("button", { name: "完成預約" }));

  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/bookings", {
    resource_id: "court-1",
    start_time: "2026-10-07T18:00:00Z",
    end_time: "2026-10-07T20:00:00Z",
  }, expect.any(Object)));
  jest.restoreAllMocks();
});
