import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import NearbyMap from "./nearbyMap";
import Calendar from "./dayPick";

function FieldFilterButton({ type }) {
  const filter = type || "全部";
  const navigate = useNavigate();
  const tableRef = useRef(null);
  const [selectColumn, setSelectColumn] = useState(null);
  const [viewMode, setViewMode] = useState("byDate");
  const [selectedSlots, setSelectedSlots] = useState({
    fieldKey: null,
    times: []
  });
  const toggleSlot = (fieldKey, timeIndex) => {
    setSelectedSlots(prev => {
      const { fieldKey: prevKey, times } = prev;

      if (!prevKey) {
        return { fieldKey, times: [timeIndex] };
      }

      if (prevKey !== fieldKey) {
        return { fieldKey, times: [timeIndex] };
      }

      if (times.includes(timeIndex)) {
        return { fieldKey, times: times.filter(t => t !== timeIndex) };
      }

      const min = Math.min(...times);
      const max = Math.max(...times);
      const isAdjacent =
        timeIndex === min - 1 ||
        timeIndex === max + 1;

      if (!isAdjacent) {
        return { fieldKey, times: [timeIndex] };
      }

      return { fieldKey, times: [...times, timeIndex].sort((a, b) => a - b) };
    });
  };
  const [priceTotal, setPriceTotal] = useState(0);

  const mockFields = [
    { id: 1, type: "羽球場", isSchool: true, name: "羽球場一號", pict: "/field_img/badminton.jpg", desc: "在台科大裡面的羽球場" },
    { id: 2, type: "網球場", isSchool: true, name: "網球場一號", pict: "/field_img/tennis-field.png", desc: "這裡是網球場所以不能煮飯" },
    { id: 3, type: "籃球場", isSchool: true, name: "籃球場一號", pict: "/field_img/basketball.jpg", desc: "這裡是打籃球的地方不是打架的地方" },
    { id: 4, type: "排球場", isSchool: true, name: "排球場一號", pict: "/field_img/volleyball.jpg", desc: "這裡是介紹訊息" },
    { id: 5, type: "網球場", isSchool: false, name: "校外某一個網球場", pict: "/field_img/tennis-not-school.jpg", desc: "我不是台科大的" },
    { id: 6, type: "排球場", isSchool: false, name: "排球場二號", pict: "/field_img/volleyball.jpg", desc: "這裡是介紹訊息" },
    { id: 2, type: "羽球場", isSchool: false, name: "新羽力_羽球場", pict: "/field_img/pintu_bad.jpg", desc: "這裡是介紹訊息" },
    { id: 3, type: "羽球場", isSchool: false, name: "北新_羽球場", pict: "/field_img/bad.jpg", desc: "這裡是介紹訊息" },
    { id: 4, type: "羽球場", isSchool: false, name: "新店國小_羽球場", pict: "/field_img/comeshame.webp", desc: "這裡是介紹訊息" },
    { id: 5, type: "羽球場", isSchool: false, name: "康軒文教_羽球場", pict: "/field_img/northnew.jpg", desc: "這裡是介紹訊息" },
  ];
  
  const filteredFields = filter === "全部"
    ? mockFields
    : mockFields.filter(field => field.type === filter);

  const [selectedField, setSelectedField] = useState(filteredFields[0]);

  const handleScrollToColumn = (index) => {
    index++;
    if (tableRef.current) {
      const headers = tableRef.current.querySelectorAll("th");
      const targetHeader = headers[index];
      if (targetHeader) {
        console.log(tableRef);
        tableRef.current.scrollTo({
          left: targetHeader.offsetLeft - 150,
          behavior: "smooth",
        });
      }
      setViewMode("byPlace");
      setSelectColumn(index);
      const field = filteredFields.find(f => f.id === index);
      if (field) {
        setSelectedField(field);
      }
    }
  };


  const handleFieldClick = (fieldName, isSchool, field_img) => {
    navigate(`/${fieldName}/${isSchool}/${field_img}`);
  };

  const timeSlots = [
    "08:00 - 09:00",
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 13:00",
    "13:00 - 14:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
    "16:00 - 17:00",
  ];
  const timePrices = [200, 200, 250, 250, 300, 300, 300, 350, 350];

  const fieldCourts = {
    1: [1, 2, 3, 4],
    2: [1, 2],
    3: [1, 2, 3],
    4: [1],
    5: [1, 2],
    6: [1, 2, 3],
    7: [1, 2],
    8: [1, 2, 3, 4],
    9: [1],
    10: [1, 2, 3],
  };

  return (
    <>
      <div class="flex flex-row justify-center items-center m-4 gap-4">
        <div class="flex text-xl font-semibold">
          預約日期 :
        </div>
        <Calendar />
      </div>
      <NearbyMap filter={filter} onConfirmPlace={handleScrollToColumn} />

      <div className="flex justify-center">
        <button
          onClick={() => setViewMode(viewMode === "byDate" ? "byPlace" : "byDate")}
          className="bg-blue-500 md:bg-blue-300 mt-4 px-4 py-1 rounded text-white hover:bg-blue-500 transition"
        >
          切換為 {viewMode === "byDate" ? "單場地七日" : "單日所有場地"}
        </button>
      </div>

      <div ref={tableRef} class={`overflow-x-auto m-5 mb-[100px] border border-gray-100 rounded-lg shadow-neutral-800`}>
        <table class="min-w-full rounded-lg border-collapse shadow-sm text-center text-sm">
          <thead class="bg-blue-100 text-gray-700 text-lg">
            <tr>
              <th class="px-2 py-2 font-semibold sticky left-0 bg-blue-100 min-w-[100px] text-xs md:text-sm leading-tight">
                時間
              </th>
              {viewMode === "byDate"
                ? filteredFields.map((field) => (
                  <th
                    key={field.id}
                    onClick={() => handleFieldClick(field.name, field.isSchool, field.pict)}
                    class="px-4 py-2 border whitespace-nowrap cursor-pointer border-gray-300"
                  >
                    <div class={` ${selectColumn === field.id ? "bg-blue-800"  : "bg-blue-400"} text-white px-4 py-1 rounded-full transition-transform hover:scale-110 shadow-md inline-block`}>
                      {field.name}
                    </div>
                  </th>
                ))
                : Array.from({ length: 7 }).map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  return (
                    <th key={i} class="px-4 py-2 border border-gray-300 whitespace-nowrap">
                      {date.toLocaleDateString("zh-TW", { weekday: "short", month: "numeric", day: "numeric" })}
                    </th>
                  );
                })}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, index) => (
              <tr key={index} class={`hover:bg-gray-50 transition ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                <td class="px-2 py-2 border border-gray-300 font-ms text-gray-700 sticky left-0 bg-blue-50 min-w-[80px] text-xs md:text-sm leading-tight">
                  {slot}
                </td>
                {viewMode === "byDate"
                  ? filteredFields.map((field) => (
                    <td key={field.id} class="px-2 py-2 border border-gray-300">
                      <div class="flex justify-center gap-2 ">
                        {fieldCourts[field.id].map((court) => (
                          <button
                            key={court}
                            onClick={() => toggleSlot(`${court}-${field.name}`, index)}
                            class={`hidden md:table-cell w-8 h-10 rounded-full font-medium transition
                                ${selectedSlots.fieldKey === `${court}-${field.name}` && selectedSlots.times.includes(index)
                                ? "bg-blue-600 text-white"
                                : "bg-blue-100 text-blue-600 hover:bg-blue-500 hover:text-white"}
                              `}
                          >
                            {court}
                          </button>
                        ))}
                        <button
                          onClick={() => toggleSlot(`${field.name}`, index)}
                          class={`md:hidden ${selectedSlots.fieldKey === `${field.name}` && selectedSlots.times.includes(index)
                            ? "bg-blue-600 text-gray-100"
                            : "bg-blue-100 text-blue-600"} text-xs font-semibold px-2 py-1 rounded-md shadow`}
                        >
                          確認此時段
                        </button>

                      </div>
                    </td>
                  ))
                  : Array.from({ length: 7 }).map((_, i) => (
                    <td key={i} class="px-2 py-2 border border-gray-300">
                      <div class="flex justify-center gap-2 ">
                        {fieldCourts[selectedField.id].map((court) => (
                          <button
                            key={court}
                            onClick={() =>
                              handleFieldClick(selectedField.name, selectedField.isSchool, selectedField.pict)
                            }
                            class="hidden md:table-cell w-8 h-10 rounded-full bg-blue-100 text-blue-600 font-medium hover:bg-blue-500 hover:text-white transition"
                          >
                            {court}
                          </button>
                        ))}
                      </div>
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedSlots.times.length > 0 && (
        <div class="fixed bottom-0 w-full flex justify-between items-center m-5">
          <div class="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg shadow font-semibold">
            {(() => {
              const startIndex = Math.min(...selectedSlots.times);
              const endIndex = Math.max(...selectedSlots.times);
              const startTime = timeSlots[startIndex].split(" - ")[0];
              const endTime = timeSlots[endIndex].split(" - ")[1];
              return `你已選擇：${startTime} - ${endTime}`;
            })()}
            <br />
            {`總金額：$${selectedSlots.times.reduce((sum, idx) => sum + timePrices[idx], 0)}`}
          </div>

          <div className="fixed bottom-0 w-full right-[20px] flex justify-end pb-4">
            <button
              onClick={() => {
                const startIndex = Math.min(...selectedSlots.times);
                const endIndex = Math.max(...selectedSlots.times);
                const startTime = timeSlots[startIndex].split(" - ")[0];
                const endTime = timeSlots[endIndex].split(" - ")[1];

                navigate("/pay", {
                  state: {
                    fieldName: selectedSlots.fieldKey,
                    fieldNo: "",
                    date: new Date().toLocaleDateString("zh-TW"),
                    timeRange: `${startTime} - ${endTime}`,
                    hours: selectedSlots.times.length,
                    totalPrice: selectedSlots.times.reduce(
                      (sum, idx) => sum + timePrices[idx],
                      0
                    ),
                  },
                });
              }}
              class="bg-green-500 text-white border px-8 py-2.5 rounded-xl shadow-lg hover:bg-green-600 transition font-semibold"
            >
              完成預約
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default FieldFilterButton;
