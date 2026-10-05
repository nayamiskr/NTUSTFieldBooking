import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import BookingPage from "./BookingPage";
import api from "../../baseApi";
import { earliestBookingDate } from "../bookingWindow";

jest.mock("react-router-dom", () => ({
  useParams: () => ({ id: "location-1" }),
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}), { virtual: true });
jest.mock("../components/navbar", () => () => null);
jest.mock("../../components/loading", () => () => null);
jest.mock("../../components/dayPicker/dayPick", () => () => null);
jest.mock("../components/VenueBookingCards", () => ({ fields, selectedVenueId, detailMode, selectedDate }) => <div data-testid="booking-table">
  {`${fields[0].name}・${fields[0].resources[0].name}・${selectedVenueId}・${detailMode}・${selectedDate.toLocaleDateString("zh-TW")}`}
</div>);
jest.mock("../../baseApi", () => ({ get: jest.fn() }));

beforeEach(() => api.get.mockReset());

test("shows location details and reuses the seven-day booking table", async () => {
  api.get.mockImplementation((path) => path === "/locations/location-1"
    ? Promise.resolve({ data: {
      id: "location-1",
      name: "新羽力羽球俱樂部",
      organization: { name: "校友會" },
      opening: true,
      description: "場館介紹",
      capacity: 20,
      opening_hours_start: "09:00:00",
      opening_hours_end: "22:00:00",
      location_info: "體育館二樓",
      parking_name: "地下停車場",
      latitude: 25.01,
      longitude: 121.54,
      parking_latitude: 25.02,
      parking_longitude: 121.55,
      rule: "穿著運動鞋,離場前清理",
      facility: "waterdis_accessible_restRoom_motorcycleParking_carParking_equipmentRental",
      cover: "/files/cover.jpg",
    } })
    : Promise.resolve({ data: { items: [{ id: "resource-1", name: "左面", price: 250 }] } }));

  render(<BookingPage />);

  expect(await screen.findByRole("heading", { name: "新羽力羽球俱樂部" })).toBeInTheDocument();
  expect(screen.getByText("體育館二樓")).toBeInTheDocument();
  expect(screen.getByText("地下停車場")).toBeInTheDocument();
  expect(screen.getByText("穿著運動鞋")).toBeInTheDocument();
  expect(screen.getByText("飲水機")).toBeInTheDocument();
  expect(screen.getByText("無障礙設施")).toBeInTheDocument();
  expect(screen.getByText("廁所")).toBeInTheDocument();
  expect(screen.getByText("機車停車場")).toBeInTheDocument();
  expect(screen.getByText("汽車停車場")).toBeInTheDocument();
  expect(screen.getByText("器材租借")).toBeInTheDocument();
  expect(screen.getByText("飲水機").querySelector("svg")).toBeInTheDocument();
  expect(screen.queryByText("waterdis_accessible_restRoom_motorcycleParking_carParking_equipmentRental")).not.toBeInTheDocument();
  expect(screen.getByRole("img", { name: "新羽力羽球俱樂部場地照片" })).toHaveAttribute("src", "https://api-field.gravitycat.tw/files/cover.jpg");
  expect(screen.getAllByRole("link", { name: /地圖中查看|查看停車位置/ })).toHaveLength(2);
  expect(screen.getByTestId("booking-table")).toHaveTextContent("新羽力羽球俱樂部・左面・location-1・true");
  expect(screen.getByTestId("booking-table")).toHaveTextContent(earliestBookingDate().toLocaleDateString("zh-TW"));
  expect(api.get).toHaveBeenCalledWith("/resources", expect.objectContaining({ params: { location_id: "location-1" } }));

  const initialTable = screen.getByTestId("booking-table").textContent;
  fireEvent.click(screen.getByRole("button", { name: "下一週" }));
  await waitFor(() => expect(screen.getByTestId("booking-table").textContent).not.toBe(initialTable));
});
