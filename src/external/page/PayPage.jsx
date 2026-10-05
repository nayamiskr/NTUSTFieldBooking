import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../baseApi";
import { successPopup } from "../../components/pop-up";
import { earliestBookingDate, isDateBookable } from "../bookingWindow";

const clockMinutes = (value) => {
  const match = typeof value === "string" ? value.match(/^(\d{1,2}):(\d{2})/) : null;
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour <= 24 && minute < 60 ? hour * 60 + minute : null;
};

function PayPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const {
    fieldName,
    fieldId,
    resourceName,
    resourceIdx,
    date,
    timeRange,
    hours,
    totalPrice,
  } = location.state || {};

  if (!location.state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          返回預約頁
        </button>
      </div>
    );
  }

  const parseTimeRange = (range) => {
    if (range == null) return null;
    const s = String(range).replaceAll("～", "~");

    const matches = s.match(/\b\d{1,2}:\d{2}\b/g);
    if (!matches || matches.length < 2) return null;

    return { start: matches[0], end: matches[1] };
  };
  const normalizeYmd = (d) => {
    if (!d) return null;

    if (d instanceof Date && !Number.isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }

    const s = String(d).trim();

    const m = s.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
    if (!m) return null;

    const y = m[1];
    const mo = String(m[2]).padStart(2, "0");
    const da = String(m[3]).padStart(2, "0");
    return `${y}-${mo}-${da}`;
  };

  const toBookingApiTime = (ymd, hhmm) => {
    const d = normalizeYmd(ymd);
    if (!d || !hhmm) return null;

    const parts = d.split("-");
    if (parts.length !== 3) return null;

    const y = Number(parts[0]);
    const mo = Number(parts[1]);
    const da = Number(parts[2]);

    const [hhRaw, mmRaw] = String(hhmm).split(":");
    const hh = Number(hhRaw);
    const mm = Number(mmRaw);

    if ([y, mo, da, hh, mm].some((n) => !Number.isInteger(n))) return null;
    if (hh > 23 || mm > 59) return null;

    const utc = new Date(Date.UTC(y, mo - 1, da, hh, mm));
    if (utc.getUTCFullYear() !== y || utc.getUTCMonth() + 1 !== mo || utc.getUTCDate() !== da) return null;
    return utc.toISOString().replace(".000Z", "Z");
  };

  async function handlePayment() {
    setSubmitError(null);

    if (!resourceIdx) {
      console.warn("[預約場地] 未送出：缺少 resource_id", { fieldId, fieldName, resourceName, date, timeRange });
      setSubmitError("找不到 resource_id（請重新選擇場地/球場後再試一次）");
      return;
    }

    const tr = parseTimeRange(timeRange);
    const start_time = toBookingApiTime(date, tr?.start);
    const end_time = toBookingApiTime(date, tr?.end);

    const bookingPayload = {
      resource_id: resourceIdx,
      start_time,
      end_time,
    };
    const bookingContext = { fieldId, fieldName, resourceName, date, timeRange };
    console.log("[預約場地] 準備送出", { ...bookingContext, payload: bookingPayload });

    if (!start_time || !end_time) {
      console.warn("[預約場地] 未送出：時段格式無法解析", { ...bookingContext, payload: bookingPayload });
      setSubmitError("時段格式無法解析（請返回修改預約）");
      return;
    }

    const [year, month, day] = normalizeYmd(date).split("-").map(Number);
    if (!isDateBookable(new Date(year, month - 1, day))) {
      console.warn("[預約場地] 未送出：需提前 7 天預約", { ...bookingContext, payload: bookingPayload });
      setSubmitError(`需提前 7 天預約，最早可選 ${earliestBookingDate().toLocaleDateString("zh-TW")}。請返回重新選擇日期。`);
      return;
    }

    const token = localStorage.getItem("token")

    try {
      setIsSubmitting(true);

      if (fieldId) {
        const { data: venue } = await api.get(`/locations/${fieldId}`);
        const opens = clockMinutes(venue?.opening_hours_start);
        const closes = clockMinutes(venue?.opening_hours_end);
        const startsAt = clockMinutes(tr.start);
        const endsAt = clockMinutes(tr.end);
        console.log("[預約場地] 營業時間檢查", {
          fieldId,
          opening: venue?.opening,
          opening_hours_start: venue?.opening_hours_start,
          opening_hours_end: venue?.opening_hours_end,
          selected_start: tr.start,
          selected_end: tr.end,
        });

        if (venue?.opening === false) {
          console.warn("[預約場地] 未送出：場地暫停開放", bookingContext);
          setSubmitError("此場地目前暫停開放，請返回選擇其他場地。");
          return;
        }
        if (opens === null || closes === null || startsAt === null || endsAt === null) {
          console.warn("[預約場地] 未送出：無法確認營業時間", bookingContext);
          setSubmitError("無法確認場地營業時間，請稍後再試。");
          return;
        }
        if (startsAt < opens || endsAt >= closes || startsAt >= endsAt) {
          console.warn("[預約場地] 未送出：時段不在可預約時間內", { ...bookingContext, payload: bookingPayload });
          setSubmitError(`所選時段不在場地可預約時間內（營業時間 ${venue.opening_hours_start.slice(0, 5)}–${venue.opening_hours_end.slice(0, 5)}）。請返回重新選擇。`);
          return;
        }
      }

      console.log("[預約場地] POST /bookings", bookingPayload);
      await api.post(
        "/bookings",
        bookingPayload,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      await successPopup("預約已送出", "請耐心等候審核，並依場地方通知於現場付款。");
      navigate(`/external/order`);
    } catch (e) {
      console.error("[預約場地] 送出失敗", {
        ...bookingContext,
        payload: bookingPayload,
        status: e?.response?.status,
        response: e?.response?.data,
        message: e?.message,
      });
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "送出失敗";
      setSubmitError(/booking must fall within the location's opening hours/i.test(msg)
        ? "所選時段不在場地可預約時間內，請返回重新選擇。"
        : msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-6">

        {/* 標題 */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800">確認預約</h1>
          <p className="text-sm text-gray-500 mt-1">
            請確認以下訂單資訊
          </p>
        </div>

        {/* 訂單內容 */}
        <div className="border rounded-lg divide-y">
          <div className="flex justify-between px-4 py-3 text-sm">
            <span className="text-gray-500">場地</span>
            <span className="font-medium text-gray-800">
              {fieldName}
            </span>
          </div>

          {resourceName && <div className="flex justify-between px-4 py-3 text-sm">
            <span className="text-gray-500">場面</span>
            <span className="font-medium text-gray-800">{resourceName}</span>
          </div>}

          <div className="flex justify-between px-4 py-3 text-sm">
            <span className="text-gray-500">日期</span>
            <span className="font-medium text-gray-800">{date}</span>
          </div>

          <div className="flex justify-between px-4 py-3 text-sm">
            <span className="text-gray-500">時段</span>
            <span className="font-medium text-gray-800">
              {timeRange}
            </span>
          </div>

          <div className="flex justify-between px-4 py-3 text-sm">
            <span className="text-gray-500">時數</span>
            <span className="font-medium text-gray-800">
              {hours} 小時
            </span>
          </div>

        </div>

        {/* 總金額 */}
        <div className="flex justify-between items-center bg-blue-50 rounded-lg px-4 py-3">
          <span className="text-gray-600 font-medium">現場應付金額</span>
          <span className="text-xl font-bold text-blue-600">
            NT$ {totalPrice}
          </span>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
          <h2 className="font-semibold">付款方式：現場付款</h2>
          <p className="mt-2 leading-6">送出後會建立預約並等待審核，此頁不會線上扣款。請依場地方通知，在現場支付上方金額。</p>
        </div>

        {submitError && (
          <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg px-4 py-2 text-sm">
            {submitError}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handlePayment}
            disabled={isSubmitting}
            className={`w-full bg-blue-600 text-white font-semibold py-3 rounded-lg transition ${isSubmitting ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700"}`}
          >
            {isSubmitting ? "送出中..." : "送出預約"}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full border border-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-100 transition"
          >
            返回修改預約
          </button>
        </div>


      </div>
    </div>
  );
}

export default PayPage;
