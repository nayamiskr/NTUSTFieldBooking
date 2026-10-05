import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../baseApi";
import { useAuthStore } from "../../store/authStore";
import { earliestBookingDate } from "../bookingWindow";

const HOURS = Array.from({ length: 24 }, (_, index) => index);
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const hourText = (hour) => `${String(hour).padStart(2, "0")}:00`;
const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const priceText = (price) => Number.isFinite(Number(price)) ? `NT$ ${Number(price).toLocaleString("zh-TW")}` : "價格未提供";
const resourceLabel = (resource, index) => typeof resource?.name === "string" && resource.name.trim() ? resource.name.trim() : `第 ${index + 1} 面`;

function timeInMinutes(value, fallback) {
  const match = typeof value === "string" ? value.match(/^(\d{1,2}):(\d{2})/) : null;
  if (!match) return fallback;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours <= 24 && minutes < 60 ? hours * 60 + minutes : fallback;
}

function bookableHours(field) {
  if (!field || field.opening === false) return [];
  const opens = timeInMinutes(field.opening_hours_start, null);
  const closes = timeInMinutes(field.opening_hours_end, null);
  if (opens === null || closes === null || opens >= closes) return [];
  return HOURS.filter((hour) => hour * 60 >= opens && (hour + 1) * 60 < closes);
}

function parseBookingTime(value) {
  // The booking POST sends the selected wall-clock hour with a Z suffix.
  const wallTime = typeof value === "string" ? value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(?:Z|\+00:00)$/i) : null;
  if (wallTime) {
    return new Date(Number(wallTime[1]), Number(wallTime[2]) - 1, Number(wallTime[3]), Number(wallTime[4]), Number(wallTime[5]), Number(wallTime[6] || 0));
  }
  return new Date(value);
}

function slotIsBooked(bookings, resourceId, slotStart) {
  const slotEnd = new Date(slotStart);
  slotEnd.setHours(slotEnd.getHours() + 1);
  return bookings.some((booking) => {
    if (["cancelled", "rejected"].includes(booking.status)) return false;
    if (String(booking.resource_id ?? booking.resource?.id) !== String(resourceId)) return false;
    const start = parseBookingTime(booking.start_time);
    const end = parseBookingTime(booking.end_time);
    return Number.isFinite(start.getTime()) && Number.isFinite(end.getTime()) && start < slotEnd && end > slotStart;
  });
}

export default function VenueBookingCards({ fields, selectedDate, selectedVenueId = null, detailMode = false }) {
  const navigate = useNavigate();
  const userId = useAuthStore((state) => state.userId);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [viewMode, setViewMode] = useState(detailMode ? "week" : "table");
  const [selection, setSelection] = useState(null);
  const now = new Date();
  const firstBookableDate = earliestBookingDate(now);

  useEffect(() => {
    if (selectedVenueId == null) return;
    setViewMode("week");
    setSelection(null);
  }, [selectedVenueId]);

  useEffect(() => {
    let active = true;
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    setLoading(true);
    setError(false);
    setSelection(null);
    if (!userId) {
      setBookings([]);
      setError(true);
      setLoading(false);
      return () => { active = false; };
    }
    api.get("/bookings", {
      headers: localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : undefined,
      params: { user_id: userId, start_time: `${dateKey(start)}T00:00:00Z`, end_time: `${dateKey(end)}T00:00:00Z` },
    }).then((response) => {
      const items = response.data?.items ?? response.data;
      if (!Array.isArray(items)) throw new Error("Invalid bookings response");
      const ownBookings = items.filter((booking) => {
        const bookingUserId = booking.user_id ?? booking.user?.id;
        return bookingUserId == null || String(bookingUserId) === String(userId);
      });
      if (active) setBookings(ownBookings);
    }).catch(() => {
      if (active) { setBookings([]); setError(true); }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selectedDate, userId]);

  const slotStatus = (field, resource, hour, date = selectedDate) => {
    const slotStart = new Date(date);
    slotStart.setHours(hour, 0, 0, 0);
    if (!loading && !error && slotIsBooked(bookings, resource.id, slotStart)) return "我已預約";
    if (!bookableHours(field).includes(hour)) return "未開放";
    if (slotStart <= now) return "已過時段";
    if (slotStart < firstBookableDate) return "需提前 7 天";
    if (loading || error) return "未確認";
    return "可選擇";
  };
  const isAvailable = (field, resource, hour, date = selectedDate) => slotStatus(field, resource, hour, date) === "可選擇";

  const hasAvailability = (field) => field.resources.some((resource) => bookableHours(field).some((hour) => isAvailable(field, resource, hour)));
  const visibleFields = availableOnly ? fields.filter(hasAvailability) : fields;
  const visibleHours = [...new Set(visibleFields.flatMap(bookableHours))].sort((a, b) => a - b);
  const focusedField = fields.find((field) => String(field.id) === String(selectedVenueId));
  const focusedHours = bookableHours(focusedField);
  const weekDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + index);
    return date;
  });
  const selectedField = fields.find((field) => String(field.id) === String(selection?.fieldId));
  const selectedResource = selectedField?.resources.find((resource) => String(resource.id) === String(selection?.resourceId));
  const selectedResourceLabel = selectedResource ? resourceLabel(selectedResource, selectedField.resources.indexOf(selectedResource)) : "";
  const hours = selection?.hours || [];
  const selectedDay = selection?.date || selectedDate;
  const totalPrice = Number(selectedResource?.price) * hours.length;

  function chooseHour(field, resource, hour, date = selectedDate) {
    if (!isAvailable(field, resource, hour, date)) return;
    setSelection((previous) => {
      if (previous?.fieldId !== field.id || previous?.resourceId !== resource.id || dateKey(previous.date) !== dateKey(date)) {
        return { fieldId: field.id, resourceId: resource.id, date, hours: [hour] };
      }
      if (previous.hours.includes(hour)) {
        const remaining = previous.hours.filter((item) => item !== hour);
        return remaining.length ? { ...previous, hours: remaining } : null;
      }
      const next = [...previous.hours, hour].sort((a, b) => a - b);
      const contiguous = next.every((item, index) => index === 0 || item === next[index - 1] + 1);
      return { ...previous, hours: contiguous ? next : [hour] };
    });
  }

  function continueBooking() {
    if (!selectedField || !selectedResource || !hours.length || !Number.isFinite(totalPrice)) return;
    if (!hours.every((hour) => isAvailable(selectedField, selectedResource, hour, selectedDay))) return;
    navigate("/external/pay", { state: {
      fieldName: selectedField.name,
      fieldId: selectedField.id,
      resourceName: selectedResourceLabel,
      resourceIdx: selectedResource.id,
      date: selectedDay.toLocaleDateString("zh-TW"),
      timeRange: `${hourText(hours[0])} - ${hourText(hours[hours.length - 1] + 1)}`,
      hours: hours.length,
      totalPrice,
    } });
  }

  return <section id="venue-booking-section" aria-label="場地與可預約時段" className="mx-auto max-w-7xl scroll-mt-4 px-4 pb-36 sm:px-6">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{detailMode ? "預約時段" : "選擇場地與時段"}</h2>
        <p className="mt-1 text-sm text-slate-600">{viewMode === "week" && focusedField ? `${focusedField.name}・${weekDates[0].toLocaleDateString("zh-TW")} 至 ${weekDates[6].toLocaleDateString("zh-TW")}` : `${selectedDate.toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}・${visibleFields.length} 個場地`}</p>
      </div>
      {!detailMode && <div className="flex flex-wrap gap-2">
        {viewMode !== "week" && <button type="button" aria-pressed={availableOnly} onClick={() => setAvailableOnly((value) => !value)}
          className={`rounded-full border px-4 py-2 text-sm font-semibold ${availableOnly ? "border-blue-700 bg-blue-50 text-blue-700" : "border-slate-300 bg-white text-slate-700"}`}>只看可選時段</button>}
        <div role="group" aria-label="場地檢視方式" className="flex overflow-hidden rounded-full border border-slate-300 bg-white text-sm font-semibold">
          <button type="button" aria-pressed={viewMode === "table"} onClick={() => setViewMode("table")}
            className={`px-4 py-2 ${viewMode === "table" ? "bg-blue-700 text-white" : "text-slate-700 hover:bg-slate-50"}`}>多場地單日</button>
          {focusedField && <button type="button" aria-pressed={viewMode === "week"} onClick={() => setViewMode("week")}
            className={`border-l border-slate-200 px-4 py-2 ${viewMode === "week" ? "bg-blue-700 text-white" : "text-slate-700 hover:bg-slate-50"}`}>單場地七日</button>}
          <button type="button" aria-pressed={viewMode === "cards"} onClick={() => setViewMode("cards")}
            className={`border-l border-slate-200 px-4 py-2 ${viewMode === "cards" ? "bg-blue-700 text-white" : "text-slate-700 hover:bg-slate-50"}`}>卡片</button>
        </div>
      </div>}
    </div>
    {loading && <p role="status" className="mb-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">正在確認我的預約時段…</p>}
    {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{userId ? "目前無法確認我的預約時段，請稍後重新整理頁面。" : "請先登入，才能確認自己的預約時段。"}</p>}
    {!loading && viewMode !== "week" && !visibleFields.length && <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">{availableOnly ? "這個日期目前沒有符合條件的場地，試試其他日期。" : "目前沒有場地資料。"}</p>}
    {viewMode === "table" && visibleFields.length > 0 && !visibleHours.length && <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">目前沒有可顯示的營業時段。</p>}
    {viewMode === "week" && focusedField && !focusedHours.length && <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">{focusedField.opening === false ? "此場地目前暫停開放。" : "目前沒有可顯示的營業時段。"}</p>}
    {viewMode === "table" && visibleHours.length > 0 && <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-max border-collapse text-center text-sm">
        <thead><tr className="bg-blue-50">
          <th scope="col" className="sticky left-0 z-20 w-[76px] min-w-[76px] border-b border-r border-slate-200 bg-blue-50 px-1 py-4 text-slate-800 sm:w-32 sm:min-w-32 sm:px-3">時段</th>
          {visibleFields.map((field) => <th id={`venue-${field.id}`} key={field.id} scope="col" className="min-w-44 border-b border-r border-slate-200 px-4 py-3 text-slate-900">
            <button type="button" onClick={() => navigate(`/external/${field.id}`)} className="font-bold text-blue-800 hover:underline">{field.name}</button>
            <span className="mt-1 block text-xs font-normal text-slate-600">{field.resources.length} 面場地</span>
          </th>)}
        </tr></thead>
        <tbody>{visibleHours.map((hour) => <tr key={hour}>
          <th scope="row" aria-label={`${hourText(hour)} 至 ${hourText(hour + 1)}`} className="sticky left-0 z-10 w-[76px] min-w-[76px] border-b border-r border-slate-200 bg-slate-50 px-1 py-2 font-semibold text-slate-800 sm:w-32 sm:min-w-32 sm:px-3 sm:py-3">
            <span className="flex flex-col items-center text-[11px] leading-4 sm:hidden"><span>{hourText(hour)}</span><span className="text-slate-500">至 {hourText(hour + 1)}</span></span>
            <span className="hidden whitespace-nowrap sm:inline">{hourText(hour)}–{hourText(hour + 1)}</span>
          </th>
          {visibleFields.map((field) => <td key={field.id} className="border-b border-r border-slate-200 px-3 py-2">
            {bookableHours(field).includes(hour) ? <div className="flex min-w-max justify-center gap-2">{field.resources.map((resource, index) => {
              const status = slotStatus(field, resource, hour);
              const available = status === "可選擇";
              const selected = selection?.fieldId === field.id && selection?.resourceId === resource.id && hours.includes(hour);
              return <button key={resource.id} type="button" disabled={!available} onClick={() => chooseHour(field, resource, hour)} aria-pressed={selected}
                aria-label={`${field.name}${resourceLabel(resource, index)} ${hourText(hour)} 至 ${hourText(hour + 1)}，${status}`}
                title={`${resourceLabel(resource, index)}・${priceText(resource.price)} / 小時`}
                className={`min-h-11 min-w-16 rounded-lg border px-3 py-1 font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${selected ? "border-blue-700 bg-blue-700 text-white" : available ? "border-blue-200 bg-blue-50 text-blue-800 hover:border-blue-600 hover:bg-blue-100" : status === "我已預約" ? "cursor-not-allowed border-amber-200 bg-amber-50 text-amber-800" : "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400"}`}>
                <span className="block">{resourceLabel(resource, index)}</span>{["需提前 7 天", "我已預約"].includes(status) && <span className="block text-[10px] font-normal">{status}</span>}
              </button>;
            })}</div> : <span className="text-xs text-slate-400">非營業時間</span>}
          </td>)}
        </tr>)}</tbody>
      </table>
    </div>}
    {viewMode === "week" && focusedField && focusedHours.length > 0 && <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-max border-collapse text-center text-sm">
        <thead><tr className="bg-blue-50">
          <th scope="col" className="sticky left-0 z-20 w-[76px] min-w-[76px] border-b border-r border-slate-200 bg-blue-50 px-1 py-4 text-slate-800 sm:w-32 sm:min-w-32 sm:px-3">時段</th>
          {weekDates.map((date) => <th key={dateKey(date)} scope="col" className="min-w-36 border-b border-r border-slate-200 px-3 py-3 text-slate-900">
            <span className="block font-bold">{date.getMonth() + 1}/{date.getDate()}（{WEEKDAYS[date.getDay()]}）</span>
          </th>)}
        </tr></thead>
        <tbody>{focusedHours.map((hour) => <tr key={hour}>
          <th scope="row" aria-label={`${hourText(hour)} 至 ${hourText(hour + 1)}`} className="sticky left-0 z-10 w-[76px] min-w-[76px] border-b border-r border-slate-200 bg-slate-50 px-1 py-2 font-semibold text-slate-800 sm:w-32 sm:min-w-32 sm:px-3 sm:py-3">
            <span className="flex flex-col items-center text-[11px] leading-4 sm:hidden"><span>{hourText(hour)}</span><span className="text-slate-500">至 {hourText(hour + 1)}</span></span>
            <span className="hidden whitespace-nowrap sm:inline">{hourText(hour)}–{hourText(hour + 1)}</span>
          </th>
          {weekDates.map((date) => <td key={dateKey(date)} className="border-b border-r border-slate-200 px-2 py-2">
            <div className="flex min-w-max justify-center gap-2">{focusedField.resources.map((resource, index) => {
              const status = slotStatus(focusedField, resource, hour, date);
              const available = status === "可選擇";
              const selected = selection?.fieldId === focusedField.id && selection?.resourceId === resource.id && selection?.date && dateKey(selection.date) === dateKey(date) && hours.includes(hour);
              return <button key={resource.id} type="button" disabled={!available} onClick={() => chooseHour(focusedField, resource, hour, date)} aria-pressed={Boolean(selected)}
                aria-label={`${date.getMonth() + 1}月${date.getDate()}日 ${resourceLabel(resource, index)} ${hourText(hour)} 至 ${hourText(hour + 1)}，${status}`}
                title={`${resourceLabel(resource, index)}・${priceText(resource.price)} / 小時`}
                className={`min-h-11 min-w-20 rounded-lg border px-2 py-1 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${selected ? "border-blue-700 bg-blue-700 text-white" : available ? "border-blue-200 bg-blue-50 text-blue-800 hover:border-blue-600 hover:bg-blue-100" : status === "我已預約" ? "cursor-not-allowed border-amber-200 bg-amber-50 text-amber-800" : "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400"}`}>
                <span className="block">{resourceLabel(resource, index)}</span><span className="block text-[10px] font-normal">{status}</span>
              </button>;
            })}</div>
          </td>)}
        </tr>)}</tbody>
      </table>
    </div>}
    {viewMode === "cards" && <div className="grid gap-5 lg:grid-cols-2">
      {visibleFields.map((field) => <article id={`venue-${field.id}`} key={field.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div><h3 className="text-xl font-bold text-slate-900">{field.name}</h3><p className="mt-2 text-sm text-slate-600">{field.location_info || "位置未提供"}</p></div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${hasAvailability(field) ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
              {loading ? "確認中" : error ? "狀態未確認" : hasAvailability(field) ? "有可選時段" : "暫無空位"}
            </span>
          </div>
          <p className="mt-4 text-sm text-slate-600">開放時間 {field.opening_hours_start?.slice(0, 5) || "未提供"}–{field.opening_hours_end?.slice(0, 5) || "未提供"}　・　{field.resources.length} 面場地</p>
        </div>
        <div className="space-y-5 p-5 sm:p-6">
          {field.resources.map((resource, index) => <div key={resource.id}>
            <div className="mb-2 flex items-center justify-between gap-2"><h4 className="font-semibold">{resourceLabel(resource, index)}</h4><span className="text-sm text-slate-600">{priceText(resource.price)} / 小時</span></div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {bookableHours(field).map((hour) => {
                const status = slotStatus(field, resource, hour);
                const available = status === "可選擇";
                const selected = selection?.fieldId === field.id && selection?.resourceId === resource.id && hours.includes(hour);
                return <button key={hour} type="button" disabled={!available} onClick={() => chooseHour(field, resource, hour)} aria-pressed={selected}
                  aria-label={`${resourceLabel(resource, index)} ${hourText(hour)} 至 ${hourText(hour + 1)}，${status}`}
                  className={`min-h-11 rounded-lg border px-2 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${selected ? "border-blue-700 bg-blue-700 text-white" : available ? "border-blue-200 bg-blue-50 text-blue-800 hover:border-blue-600 hover:bg-blue-100" : status === "我已預約" ? "cursor-not-allowed border-amber-200 bg-amber-50 text-amber-800" : "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400"}`}><span className="block">{hourText(hour)}</span>{["需提前 7 天", "我已預約"].includes(status) && <span className="block text-[10px]">{status}</span>}</button>;
              })}
            </div>
          </div>)}
          {!bookableHours(field).length && <p className="text-sm text-slate-500">{field.opening === false ? "此場地暫停開放。" : "目前沒有可顯示的營業時段。"}</p>}
          <button type="button" onClick={() => navigate(`/external/${field.id}`)} className="text-sm font-semibold text-blue-700 hover:underline">查看場地詳情 →</button>
        </div>
      </article>)}
    </div>}
    {selectedField && selectedResource && hours.length > 0 && <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white px-4 py-3 shadow-2xl sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 sm:flex-nowrap">
        <div className="min-w-0 flex-1 text-sm"><p className="truncate font-bold">{selectedField.name}・{selectedResourceLabel}</p><p className="text-slate-600">{selectedDay.toLocaleDateString("zh-TW")}　{hourText(hours[0])}–{hourText(hours[hours.length - 1] + 1)}</p></div>
        <strong className="text-lg text-blue-800">{priceText(totalPrice)}</strong>
        <button type="button" onClick={continueBooking} className="min-h-11 rounded-xl bg-blue-700 px-5 py-2 font-semibold text-white hover:bg-blue-800">前往確認</button>
        <button type="button" onClick={() => setSelection(null)} aria-label="清除選取" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">✕</button>
      </div>
    </div>}
  </section>;
}
