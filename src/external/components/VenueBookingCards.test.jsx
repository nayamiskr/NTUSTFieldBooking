import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import VenueBookingCards from "./VenueBookingCards";
import api from "../../baseApi";
import { useAuthStore } from "../../store/authStore";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate }), { virtual: true });
jest.mock("../../baseApi", () => ({ get: jest.fn() }));

beforeEach(() => {
  api.get.mockReset();
  mockNavigate.mockClear();
  useAuthStore.setState({ userId: "user-1" });
});

afterAll(() => useAuthStore.setState({ userId: null }));

test("detail mode shows the named courts' weekly status and books the chosen day", async () => {
  const selectedDate = new Date(2030, 5, 12);
  const fields = [{
    id: "location-1",
    name: "羽球館",
    opening: true,
    opening_hours_start: "08:00:00",
    opening_hours_end: "22:00:00",
    resources: [{ id: "left", name: "左面", price: 250 }, { id: "right", name: "右面", price: 300 }],
  }];
  api.get.mockResolvedValue({ data: { items: [{
    user_id: "user-1",
    resource_id: "left",
    status: "confirmed",
    start_time: "2030-06-14T10:00:00.000Z",
    end_time: "2030-06-14T11:00:00.000Z",
  }] } });

  render(<VenueBookingCards fields={fields} selectedDate={selectedDate} selectedVenueId="location-1" detailMode />);

  await waitFor(() => expect(screen.getByRole("button", { name: "6月14日 左面 10:00 至 11:00，我已預約" })).toBeDisabled());
  expect(api.get).toHaveBeenCalledWith("/bookings", expect.objectContaining({ params: {
    user_id: "user-1",
    start_time: "2030-06-12T00:00:00Z",
    end_time: "2030-06-19T00:00:00Z",
  } }));
  expect(screen.queryByRole("button", { name: "多場地單日" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "6月15日 右面 10:00 至 11:00，可選擇" }));
  expect(screen.getByText("羽球館・右面")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "前往確認" }));
  expect(mockNavigate).toHaveBeenCalledWith("/external/pay", { state: expect.objectContaining({
    date: "2030/6/15",
    resourceIdx: "right",
    resourceName: "右面",
    totalPrice: 300,
  }) });
});

test("weekly table only shows complete one-hour slots inside opening hours", async () => {
  api.get.mockResolvedValue({ data: { items: [] } });
  render(<VenueBookingCards fields={[{
    id: "evening-venue",
    name: "晚間球館",
    opening: true,
    opening_hours_start: "18:30:00",
    opening_hours_end: "22:00:00",
    resources: [{ id: "court-1", name: "左面", price: 250 }],
  }]} selectedDate={new Date(2030, 5, 12)} selectedVenueId="evening-venue" detailMode />);

  await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
  expect(screen.queryByRole("rowheader", { name: "08:00 至 09:00" })).not.toBeInTheDocument();
  expect(screen.queryByRole("rowheader", { name: "18:00 至 19:00" })).not.toBeInTheDocument();
  expect(screen.getByRole("rowheader", { name: "19:00 至 20:00" })).toBeInTheDocument();
  expect(screen.getByRole("rowheader", { name: "20:00 至 21:00" })).toBeInTheDocument();
  expect(screen.queryByRole("rowheader", { name: "21:00 至 22:00" })).not.toBeInTheDocument();
  expect(screen.queryByRole("rowheader", { name: "22:00 至 23:00" })).not.toBeInTheDocument();
});

test("multi-venue table omits court buttons outside each venue's opening hours", async () => {
  api.get.mockResolvedValue({ data: { items: [] } });
  render(<VenueBookingCards fields={[
    {
      id: "morning-venue", name: "早場", opening: true,
      opening_hours_start: "08:00:00", opening_hours_end: "10:00:00",
      resources: [{ id: "morning-court", name: "左面", price: 250 }],
    },
    {
      id: "afternoon-venue", name: "晚場", opening: true,
      opening_hours_start: "10:00:00", opening_hours_end: "13:00:00",
      resources: [{ id: "afternoon-court", name: "右面", price: 250 }],
    },
  ]} selectedDate={new Date(2030, 5, 12)} />);

  await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
  expect(screen.queryByRole("button", { name: "早場左面 10:00 至 11:00，不可預約" })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "晚場右面 10:00 至 11:00，可選擇" })).toBeInTheDocument();
});

test("weekly status requires booking seven calendar days in advance", async () => {
  api.get.mockResolvedValue({ data: { items: [] } });
  const selectedDate = new Date();
  selectedDate.setHours(0, 0, 0, 0);
  selectedDate.setDate(selectedDate.getDate() + 1);
  const firstAllowed = new Date(selectedDate);
  firstAllowed.setDate(firstAllowed.getDate() + 6);

  render(<VenueBookingCards fields={[{
    id: "location-1", name: "羽球館", opening: true,
    opening_hours_start: "08:00:00", opening_hours_end: "22:00:00",
    resources: [{ id: "court-1", name: "左面", price: 250 }],
  }]} selectedDate={selectedDate} selectedVenueId="location-1" detailMode />);

  await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
  expect(screen.getByRole("button", {
    name: `${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日 左面 10:00 至 11:00，需提前 7 天`,
  })).toBeDisabled();
  expect(screen.getByRole("button", {
    name: `${firstAllowed.getMonth() + 1}月${firstAllowed.getDate()}日 左面 10:00 至 11:00，可選擇`,
  })).toBeEnabled();
});

test("does not label another user's booking as mine", async () => {
  api.get.mockResolvedValue({ data: { items: [{
    user_id: "user-2",
    resource_id: "left",
    status: "confirmed",
    start_time: "2030-06-14T10:00:00Z",
    end_time: "2030-06-14T11:00:00Z",
  }] } });
  render(<VenueBookingCards fields={[{
    id: "location-1", name: "羽球館", opening: true,
    opening_hours_start: "08:00:00", opening_hours_end: "22:00:00",
    resources: [{ id: "left", name: "左面", price: 250 }],
  }]} selectedDate={new Date(2030, 5, 12)} selectedVenueId="location-1" detailMode />);

  await waitFor(() => expect(screen.getByRole("button", { name: "6月14日 左面 10:00 至 11:00，可選擇" })).toBeEnabled());
});

test("daily table displays my booked court and time", async () => {
  api.get.mockResolvedValue({ data: { items: [
    {
      user_id: "user-1", resource_id: "left", status: "pending",
      start_time: "2030-06-12T10:00:00Z", end_time: "2030-06-12T12:00:00Z",
    },
    {
      user_id: "user-1", resource_id: "left", status: "cancelled",
      start_time: "2030-06-12T12:00:00Z", end_time: "2030-06-12T13:00:00Z",
    },
  ] } });
  render(<VenueBookingCards fields={[{
    id: "location-1", name: "羽球館", opening: true,
    opening_hours_start: "08:00:00", opening_hours_end: "22:00:00",
    resources: [{ id: "left", name: "左面", price: 250 }, { id: "right", name: "右面", price: 250 }],
  }]} selectedDate={new Date(2030, 5, 12)} />);

  await waitFor(() => expect(screen.getByRole("button", { name: "羽球館左面 10:00 至 11:00，我已預約" })).toBeDisabled());
  expect(screen.getByRole("button", { name: "羽球館左面 11:00 至 12:00，我已預約" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "羽球館左面 12:00 至 13:00，可選擇" })).toBeEnabled();
  expect(screen.getByRole("button", { name: "羽球館右面 10:00 至 11:00，可選擇" })).toBeEnabled();
});

test("my existing booking remains visible inside the seven-day lead window", async () => {
  const selectedDate = new Date();
  selectedDate.setHours(0, 0, 0, 0);
  selectedDate.setDate(selectedDate.getDate() + 1);
  const dateText = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
  api.get.mockResolvedValue({ data: { items: [{
    user_id: "user-1", resource_id: "left", status: "confirmed",
    start_time: `${dateText}T10:00:00Z`, end_time: `${dateText}T11:00:00Z`,
  }] } });
  render(<VenueBookingCards fields={[{
    id: "location-1", name: "羽球館", opening: true,
    opening_hours_start: "08:00:00", opening_hours_end: "22:00:00",
    resources: [{ id: "left", name: "左面", price: 250 }],
  }]} selectedDate={selectedDate} />);

  await waitFor(() => expect(screen.getByRole("button", { name: "羽球館左面 10:00 至 11:00，我已預約" })).toBeDisabled());
  expect(screen.getByRole("button", { name: "羽球館左面 11:00 至 12:00，需提前 7 天" })).toBeDisabled();
});
