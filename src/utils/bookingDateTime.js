import { formatDateTime } from "./dateTimeFormat";

const hasUtcSuffix = (value) => typeof value === "string" && /(?:Z|\+00:00)$/i.test(value);
const usesUtcWallClock = (value, booking) => !booking?.booking_series_id && hasUtcSuffix(value);

// 單次預約目前把場地當地時鐘時間直接寫入 Z；季租由後端依場地時區產生。
export const formatBookingDateTime = (value, booking) =>
    formatDateTime(value, usesUtcWallClock(value, booking) ? { timeZone: "UTC" } : undefined);

const TAIPEI_OFFSET_MS = 8 * 60 * 60 * 1000;

// 單次預約的 Z 值是場地當地時鐘時間，判斷是否過期時還原成台灣實際時間。
export const bookingTimestamp = (value, booking) => {
    const timestamp = new Date(value).getTime();
    if (!Number.isFinite(timestamp)) return NaN;
    return usesUtcWallClock(value, booking)
        ? timestamp - TAIPEI_OFFSET_MS : timestamp;
};
