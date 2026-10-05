import { useEffect, useState } from "react";
import Loading from "../../components/loading";
import Navbar from "../components/navbar";
import { useParams } from "react-router-dom";
import Calendar from "../../components/dayPicker/dayPick";
import NearbyMap from "../components/nearbyMap";
import VenueBookingCards from "../components/VenueBookingCards";
import api from "../../baseApi";
import { earliestBookingDate } from "../bookingWindow";

export default function VenuePage() {
  const { fieldType } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [filteredFields, setFilteredFields] = useState([]);
  const [selectedDate, setSelectedDate] = useState(earliestBookingDate);
  const [selectedVenueId, setSelectedVenueId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadFields = async () => {
      setLoading(true);
      setError(false);
      setSelectedVenueId(null);
      try {
        const res = await api.get("/locations");
        const token = localStorage.getItem("token");
        const filteredField = await Promise.all(
          (res.data?.items || []).map(async (loc) => {
            const [detail, resource] = await Promise.all([
              api.get(`/locations/${loc.id}`),
              api.get("/resources", {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                params: { location_id: loc.id, resource_type: fieldType === "all" ? undefined : fieldType }
              }),
            ]);

            if (resource.data.items.length === 0) return null;

            return {
              ...loc,
              ...detail.data,
              resources: resource.data.items
            }
          })
        )
        if (!cancelled) {
          setFilteredFields(filteredField.filter(Boolean));
        }
      }
      catch (error) {
        if (!cancelled) setError(true);
      }
      finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadFields();
    return () => { cancelled = true; };
  }, [fieldType]);

  const dates = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(selectedDate);
    day.setDate(day.getDate() + index);
    return day;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <Loading isLoading={loading} text="載入場地資料中..." />
      <main className="mx-auto max-w-7xl px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-center my-8">我的預約</h1>


        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3"><NearbyMap filter={fieldType} fields={filteredFields} onConfirmPlace={({ place }) => {
          if (place?.id == null) return;
          setSelectedVenueId(place.id);
          requestAnimationFrame(() => document.getElementById("venue-booking-section")?.scrollIntoView({ behavior: "smooth", block: "start" }));
        }} /></div>
        <section aria-label="選擇預約日期" className="mb-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold">選擇日期</h2>
            <Calendar align="end" selectedDate={selectedDate} onDayPicked={({ date }) => setSelectedDate(date)} />
          </div>
          <p className="mb-4 text-sm text-slate-600">需提前 7 天預約，最早可選 {earliestBookingDate().toLocaleDateString("zh-TW")}。</p>
          <div className="overflow-x-auto pb-1">
            <div className="grid min-w-[560px] grid-cols-7 gap-2">
            {dates.map((date) => {
              const selected = date.toDateString() === selectedDate.toDateString();
              return <button key={date.toDateString()} type="button" aria-pressed={selected} onClick={() => setSelectedDate(date)}
                className={`rounded-xl border px-3 py-3 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${selected ? "border-blue-700 bg-blue-700 text-white" : "border-slate-200 bg-white hover:border-blue-400"}`}>
                <span className="block text-xs">週{["日", "一", "二", "三", "四", "五", "六"][date.getDay()]}</span>
                <span className="mt-1 block text-lg font-bold">{date.getMonth() + 1}/{date.getDate()}</span>
              </button>;
            })}
            </div>
          </div>
        </section>
      </main>
      {error && <p role="alert" className="mx-auto max-w-7xl px-4 text-red-700">場地資料載入失敗，請重新整理頁面。</p>}
      {!loading && !error && <VenueBookingCards fields={filteredFields} selectedDate={selectedDate} selectedVenueId={selectedVenueId} />}
    </div>
  );
}
