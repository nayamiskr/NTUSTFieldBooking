import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../baseApi";

function PayPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const {
    fieldName,
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

    const m = s.match(/(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
    if (!m) return null;

    const y = m[1];
    const mo = String(m[2]).padStart(2, "0");
    const da = String(m[3]).padStart(2, "0");
    return `${y}-${mo}-${da}`;
  };

  const toIsoUtc = (ymd, hhmm) => {
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

    if ([y, mo, da, hh, mm].some((n) => Number.isNaN(n))) return null;

    const dt = new Date(Date.UTC(y, mo - 1, da, hh, mm, 0));
    return dt.toISOString();
  };

  async function handlePayment() {
    setSubmitError(null);

    if (!resourceIdx) {
      setSubmitError("找不到 resource_id（請重新選擇場地/球場後再試一次）");
      return;
    }

    const tr = parseTimeRange(timeRange);
    const start_time = toIsoUtc(date, tr?.start);
    const end_time = toIsoUtc(date, tr?.end);

    if (!start_time || !end_time) {
      setSubmitError("時段格式無法解析（請返回修改預約）");
      return;
    }

    const token = localStorage.getItem("token")

    try {
      setIsSubmitting(true);

      const res = await api.post(
        "/bookings",
        {
          resource_id: resourceIdx,
          start_time,
          end_time,
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      alert("訂單已送出！請耐心等候審核。");
      navigate(`/order`);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "送出失敗";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-6">

        {/* 標題 */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800">預約付款確認</h1>
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
          <span className="text-gray-600 font-medium">應付金額</span>
          <span className="text-xl font-bold text-blue-600">
            NT$ {totalPrice}
          </span>
        </div>

        {/* 信用卡資訊 */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-gray-800">
            信用卡資訊
          </h2>

          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-2">
                <label className="block text-sm text-gray-600 mb-1">
                  銀行代碼
                </label>
                <input
                  type="code"
                  placeholder="代碼"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex-8">
                <label className="block text-sm text-gray-600 mb-1">
                  卡號
                </label>
                <input
                  type="card"
                  placeholder="請輸入卡號"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">
                  到期日
                </label>
                <input
                  type="month"
                  placeholder="MM / YY"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">
                  CVC / CVV
                </label>
                <input
                  type="CVV"
                  placeholder="123"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>


          </div>
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
            {isSubmitting ? "送出中..." : "前往付款"}
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