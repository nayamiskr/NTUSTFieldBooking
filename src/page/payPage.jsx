import { useLocation, useNavigate } from "react-router-dom";

function PayPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    fieldName,
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

  function handlePayment() {
    // 這裡可以加入付款邏輯
    alert("訂單已送出！請耐心等候審核。");
    navigate(`/order`);
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
                  type="text"
                  placeholder="代碼"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex-8">
                <label className="block text-sm text-gray-600 mb-1">
                  卡號
                </label>
                <input
                  type="text"
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
                  type="text"
                  placeholder="MM / YY"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">
                  CVC / CVV
                </label>
                <input
                  type="password"
                  placeholder="123"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            
          </div>
        </div>

        <div className="space-y-3">
          <button
          onClick={handlePayment}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
          >
            前往付款
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