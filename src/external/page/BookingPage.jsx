import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Building2, CalendarDays, CircleHelp, Clock3, ExternalLink, MapPin, ParkingSquare, Users } from "lucide-react";
import Navbar from "../components/navbar";
import Calendar from "../../components/dayPicker/dayPick";
import VenueBookingCards from "../components/VenueBookingCards";
import Loading from "../../components/loading";
import api from "../../baseApi";
import { facilityMap } from "../../constant/IconMap";
import { earliestBookingDate } from "../bookingWindow";

const splitItems = (value) => typeof value === "string" ? value.split(/[,，;；\n]+/).map((item) => item.trim()).filter(Boolean) : [];
const splitFacilities = (value) => typeof value === "string" ? value.split(/[,，;；\n_]+/).map((item) => item.trim()).filter(Boolean) : [];

function imageUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (!value.startsWith("/")) return null;
  const apiOrigin = new URL(process.env.REACT_APP_API_BASE_URL || "https://api-field.gravitycat.tw/v1", window.location.origin).origin;
  return `${apiOrigin}${value}`;
}

function mapsUrl(latitude, longitude) {
  if (latitude === null || latitude === undefined || latitude === "" || longitude === null || longitude === undefined || longitude === "") return null;
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180 || (lat === 0 && lng === 0)) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
}

export default function BookingPage() {
  const { id } = useParams();
  const [location, setLocation] = useState(null);
  const [resources, setResources] = useState([]);
  const [selectedDate, setSelectedDate] = useState(earliestBookingDate);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadLocation() {
      setLoading(true);
      setError(false);
      setCoverFailed(false);
      try {
        const token = localStorage.getItem("token");
        const [locationResponse, resourceResponse] = await Promise.all([
          api.get(`/locations/${id}`),
          api.get("/resources", {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            params: { location_id: id },
          }),
        ]);
        if (!active) return;
        setLocation(locationResponse.data);
        setResources(Array.isArray(resourceResponse.data?.items) ? resourceResponse.data.items : []);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    if (id) loadLocation();
    return () => { active = false; };
  }, [id]);

  const cover = imageUrl(location?.cover || location?.cover_thumbnail);
  const rules = splitItems(location?.rule);
  const facilities = splitFacilities(location?.facility);
  const locationMapUrl = mapsUrl(location?.latitude, location?.longitude);
  const parkingMapUrl = mapsUrl(location?.parking_latitude, location?.parking_longitude);
  const dates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + index);
    return date;
  });

  function shiftWeek(weeks) {
    setSelectedDate((previous) => {
      const next = new Date(previous);
      next.setDate(next.getDate() + weeks * 7);
      return next;
    });
  }

  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <Navbar />
    <Loading isLoading={loading} text="取得場地資訊中..." />
    <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
      <Link to="/external/home/all" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700"><ArrowLeft size={17} />返回場地列表</Link>
      {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">場地資訊載入失敗，請重新整理頁面。</div>}
      {!loading && !error && location && <>
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative h-48 bg-gradient-to-br from-blue-100 via-sky-100 to-slate-200 sm:h-72">
            {cover && !coverFailed && <img src={cover} alt={`${location.name}場地照片`} onError={() => setCoverFailed(true)} className="h-full w-full object-cover" />}
            {(!cover || coverFailed) && <div className="absolute inset-0 flex items-center justify-center text-blue-700"><Building2 size={64} strokeWidth={1.2} aria-hidden="true" /></div>}
          </div>
          <div className="p-5 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                {location.organization?.name && <p className="mb-2 text-sm font-semibold text-blue-700">{location.organization.name}</p>}
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{location.name}</h1>
              </div>
              <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ${location.opening ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{location.opening ? "開放預約" : "暫停開放"}</span>
            </div>
            <p className="mt-4 max-w-3xl whitespace-pre-line leading-7 text-slate-600">{location.description?.trim() || "此場地尚未提供詳細介紹。"}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4"><p className="flex items-center gap-2 text-sm text-slate-500"><Clock3 size={16} />開放時間</p><p className="mt-2 font-bold">{location.opening_hours_start?.slice(0, 5) || "未提供"}–{location.opening_hours_end?.slice(0, 5) || "未提供"}</p></div>
              <div className="rounded-xl bg-slate-50 p-4"><p className="flex items-center gap-2 text-sm text-slate-500"><Users size={16} />容納人數</p><p className="mt-2 font-bold">{Number(location.capacity) > 0 ? `${location.capacity} 人` : "未提供"}</p></div>
              <div className="rounded-xl bg-slate-50 p-4"><p className="flex items-center gap-2 text-sm text-slate-500"><Building2 size={16} />可預約場面</p><p className="mt-2 font-bold">{resources.length} 面</p></div>
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold"><MapPin size={19} className="text-blue-700" />場地位置</h2>
            <p className="mt-3 text-slate-700">{location.location_info?.trim() || "尚未提供位置資訊"}</p>
            {locationMapUrl && <a href={locationMapUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:underline">在地圖中查看 <ExternalLink size={14} /></a>}
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold"><ParkingSquare size={19} className="text-blue-700" />停車資訊</h2>
            <p className="mt-3 text-slate-700">{location.parking_name?.trim() || (parkingMapUrl ? "附近停車位置" : "尚未提供停車資訊")}</p>
            {parkingMapUrl && <a href={parkingMapUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:underline">查看停車位置 <ExternalLink size={14} /></a>}
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold">使用規則</h2>
            {rules.length ? <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">{rules.map((rule, index) => <li key={`${rule}-${index}`}>{rule}</li>)}</ul> : <p className="mt-3 text-slate-500">尚未提供使用規則。</p>}
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold">場地設施</h2>
            {facilities.length ? <div className="mt-3 flex flex-wrap gap-2">{facilities.map((facility, index) => {
              const definition = facilityMap[facility];
              return <span key={`${facility}-${index}`} className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800">
                <span aria-hidden="true" className="text-blue-700">{definition?.icon || <CircleHelp size={20} />}</span>
                {definition?.name || facility}
              </span>;
            })}</div> : <p className="mt-3 text-slate-500">尚未提供設施資訊。</p>}
          </section>
        </div>

        <section aria-label="選擇預約週次" className="my-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold"><CalendarDays size={19} className="text-blue-700" />選擇預約週次</h2>
            <Calendar align="end" selectedDate={selectedDate} onDayPicked={({ date }) => setSelectedDate(date)} />
          </div>
          <p className="mt-2 text-sm text-slate-600">需提前 7 天預約，最早可選 {earliestBookingDate().toLocaleDateString("zh-TW")}。</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => shiftWeek(-1)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50">上一週</button>
            <span className="text-sm font-semibold text-slate-700">{dates[0].toLocaleDateString("zh-TW")}–{dates[6].toLocaleDateString("zh-TW")}</span>
            <button type="button" onClick={() => shiftWeek(1)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50">下一週</button>
          </div>
        </section>
      </>}
    </main>
    {!loading && !error && location && (resources.length ? <VenueBookingCards fields={[{ ...location, resources }]} selectedDate={selectedDate} selectedVenueId={id} detailMode /> : <p className="mx-auto max-w-7xl px-4 pb-12 text-slate-600 sm:px-6">此場地目前沒有可預約的場面。</p>)}
  </div>;
}
