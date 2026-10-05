import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import PayPage from "./PayPage";
import api from "../../baseApi";
import { successPopup } from "../../components/pop-up";
import { earliestBookingDate } from "../bookingWindow";

const mockNavigate = jest.fn();
const mockState = {
  fieldId: "venue-1",
  fieldName: "北新國小羽球館",
  resourceIdx: "court-2",
  resourceName: "第二面",
  date: "2030/10/9",
  timeRange: "19:00 - 22:00",
  hours: 3,
  totalPrice: 750,
};

jest.mock("react-router-dom", () => ({
  useLocation: () => ({ state: mockState }),
  useNavigate: () => mockNavigate,
}), { virtual: true });
jest.mock("../../baseApi", () => ({ get: jest.fn(), post: jest.fn() }));
jest.mock("../../components/pop-up", () => ({ successPopup: jest.fn() }));

beforeEach(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
  api.get.mockReset();
  api.post.mockReset();
  successPopup.mockReset();
  mockNavigate.mockReset();
  mockState.date = "2030/10/9";
  mockState.timeRange = "19:00 - 22:00";
  api.get.mockResolvedValue({ data: {
    opening: true,
    opening_hours_start: "18:00:00",
    opening_hours_end: "22:00:00",
  } });
});

afterEach(() => jest.restoreAllMocks());

test("rejects a closing-boundary slot before creating a booking", async () => {
  render(<PayPage />);
  fireEvent.click(screen.getByRole("button", { name: "送出預約" }));

  expect(await screen.findByText(/所選時段不在場地可預約時間內/)).toBeInTheDocument();
  expect(api.get).toHaveBeenCalledWith("/locations/venue-1");
  expect(api.post).not.toHaveBeenCalled();
});

test("rejects dates fewer than seven days away before calling the API", async () => {
  const date = earliestBookingDate();
  date.setDate(date.getDate() - 1);
  mockState.date = date.toLocaleDateString("zh-TW");
  mockState.timeRange = "18:00 - 20:00";

  render(<PayPage />);
  fireEvent.click(screen.getByRole("button", { name: "送出預約" }));

  expect(await screen.findByText(/需提前 7 天預約/)).toBeInTheDocument();
  expect(api.get).not.toHaveBeenCalled();
  expect(api.post).not.toHaveBeenCalled();
});

test("sends the API's Z timestamp format and shows the existing success popup", async () => {
  mockState.date = "2030/10/7";
  mockState.timeRange = "18:00 - 20:00";
  api.post.mockResolvedValue({ data: { id: "booking-1" } });
  let closePopup;
  successPopup.mockReturnValue(new Promise((resolve) => { closePopup = resolve; }));
  render(<PayPage />);
  fireEvent.click(screen.getByRole("button", { name: "送出預約" }));

  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/bookings", expect.objectContaining({
    resource_id: "court-2",
    start_time: "2030-10-07T18:00:00Z",
    end_time: "2030-10-07T20:00:00Z",
  }), expect.any(Object)));
  expect(console.log).toHaveBeenCalledWith("[預約場地] POST /bookings", {
    resource_id: "court-2",
    start_time: "2030-10-07T18:00:00Z",
    end_time: "2030-10-07T20:00:00Z",
  });
  await waitFor(() => expect(successPopup).toHaveBeenCalledWith("預約已送出", expect.stringContaining("現場付款")));
  expect(mockNavigate).not.toHaveBeenCalled();
  closePopup({ isConfirmed: true });
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/external/order"));
});
