import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import VenueBookingCards from "./VenueBookingCards";
import api from "../../baseApi";
import { useAuthStore } from "../../store/authStore";

jest.mock("react-router-dom", () => ({ useNavigate: () => jest.fn() }), { virtual: true });
jest.mock("../../baseApi", () => ({ get: jest.fn() }));

const field = {
  id: "venue-1", name: "羽球館", opening: true,
  opening_hours_start: "09:00:00", opening_hours_end: "14:00:00",
  resources: [{ id: "court-1", name: "左面", price: 250 }],
};

beforeEach(() => {
  api.get.mockReset();
  useAuthStore.setState({ userId: "user-1" });
});

afterAll(() => useAuthStore.setState({ userId: null }));

test("only whole hours inside returned intervals are selectable; missing hours show booked", async () => {
  api.get.mockImplementation((url) => url === "/bookings"
    ? Promise.resolve({ data: { items: [] } })
    : Promise.resolve({ data: { date: "2030-06-12", slots: [
      { start_time: "2030-06-12T09:00:00Z", end_time: "2030-06-12T10:00:00Z" },
      { start_time: "2030-06-12T11:30:00Z", end_time: "2030-06-12T13:00:00Z" },
    ] } }));

  render(<VenueBookingCards fields={[field]} selectedDate={new Date(2030, 5, 12)} />);

  await waitFor(() => expect(screen.getByRole("button", { name: "羽球館左面 09:00 至 10:00，可選擇" })).toBeEnabled());
  expect(screen.getByRole("button", { name: "羽球館左面 10:00 至 11:00，已被預約" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "羽球館左面 11:00 至 12:00，已被預約" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "羽球館左面 12:00 至 13:00，可選擇" })).toBeEnabled();
  expect(api.get).toHaveBeenCalledWith("/resources/court-1/availability", expect.objectContaining({ params: { date: "2030-06-12" } }));
});

test("weekly view requests only the selected court's seven dates", async () => {
  api.get.mockImplementation((url, config) => url === "/bookings"
    ? Promise.resolve({ data: { items: [] } })
    : Promise.resolve({ data: { date: config.params.date, slots: [] } }));

  render(<VenueBookingCards fields={[field]} selectedDate={new Date(2030, 5, 12)} selectedVenueId="venue-1" detailMode />);

  await waitFor(() => expect(api.get.mock.calls.filter(([url]) => url.includes("/availability"))).toHaveLength(7));
  expect(api.get.mock.calls.filter(([url]) => url.includes("/availability")).map(([, config]) => config.params.date))
    .toEqual(["2030-06-12", "2030-06-13", "2030-06-14", "2030-06-15", "2030-06-16", "2030-06-17", "2030-06-18"]);
});

test("failed availability never becomes an apparently bookable hour", async () => {
  api.get.mockImplementation((url) => url === "/bookings"
    ? Promise.resolve({ data: { items: [] } })
    : Promise.reject(new Error("Unavailable")));

  render(<VenueBookingCards fields={[field]} selectedDate={new Date(2030, 5, 12)} />);

  await waitFor(() => expect(screen.getByRole("button", { name: "羽球館左面 09:00 至 10:00，未確認" })).toBeDisabled());
  expect(screen.getByRole("alert", { name: "" })).toHaveTextContent("部分場地時段暫時無法確認");
  fireEvent.click(screen.getByRole("button", { name: "羽球館左面 09:00 至 10:00，未確認" }));
  expect(screen.queryByRole("button", { name: "前往確認" })).not.toBeInTheDocument();
});
