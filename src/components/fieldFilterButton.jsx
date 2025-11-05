import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NearbyMap from "./nearbyMap";
import Calendar from "./dayPick";

function FieldFilterButton() {
  const [filter, setFilter] = useState("全部");
  const navigate = useNavigate();
  const handleFieldClick = (fieldName, isSchool, field_img) => {
    navigate(`/${fieldName}/${isSchool}/${field_img}`);
  };

  const mockFields = [
    { id: 1, type: "羽球場", isSchool: true, name: "羽球場一號", pict: "/field_img/badminton.jpg", desc: "在台科大裡面的羽球場" },
    { id: 2, type: "網球場", isSchool: true, name: "網球場一號", pict: "/field_img/tennis-field.png", desc: "這裡是網球場所以不能煮飯" },
    { id: 3, type: "籃球場", isSchool: true, name: "籃球場一號", pict: "/field_img/basketball.jpg", desc: "這裡是打籃球的地方不是打架的地方" },
    { id: 4, type: "排球場", isSchool: true, name: "排球場一號", pict: "/field_img/volleyball.jpg", desc: "這裡是介紹訊息" },
    { id: 5, type: "網球場", isSchool: false, name: "校外某一個網球場", pict: "/field_img/tennis-not-school.jpg", desc: "我不是台科大的" },
    { id: 6, type: "排球場", isSchool: false, name: "排球場二號", pict: "/field_img/volleyball.jpg", desc: "這裡是介紹訊息" },
    { id: 7, type: "羽球場", isSchool: false, name: "新店國小_羽球場", pict: "/field_img/pintu_bad.jpg", desc: "這裡是介紹訊息" },
    { id: 8, type: "羽球場", isSchool: false, name: "新羽力_羽球場", pict: "/field_img/bad.jpg", desc: "這裡是介紹訊息" },
    { id: 9, type: "羽球場", isSchool: false, name: "康軒文教_羽球場", pict: "/field_img/comeshame.webp", desc: "這裡是介紹訊息" },
    { id: 10, type: "羽球場", isSchool: false, name: "北新_羽球場", pict: "/field_img/northnew.jpg", desc: "這裡是介紹訊息" },
  ];
  const filteredFields = filter === "全部"
    ? mockFields
    : mockFields.filter(field => field.type === filter);

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
      <div style={{ width: "400px", margin: "1rem auto" }}>
        <Calendar />
      </div>
      <NearbyMap filter={filter} />
      
      <div class="overflow-x-auto m-10 boreder border-gray-100 rounded-lg shadow-neutral-800">
        <table class="min-w-full rounded-lg border-collapse shadow-sm text-center text-sm">
          <thead class="bg-blue-100 text-gray-700 text-lg">
            <tr>
              <th class="px-4 py-2  font-semibold sticky left-0 bg-blue-100">
                時間
              </th>
              {filteredFields.map((field) => (
                <th
                  key={field.id}
                  class="px-4 py-2 border border-gray-300 whitespace-nowrap"
                >
                  {field.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, index) => (
              <tr
                key={index}
                class={`hover:bg-gray-50 transition ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
              >
                <td class="px-4 py-2 border border-gray-300 font-medium text-gray-700 sticky left-0 bg-blue-50">
                  {slot}
                </td>
                {filteredFields.map((field) => (
                  <td key={field.id} class="px-2 py-2 border border-gray-300">
                    <div class="flex justify-center gap-2 ">
                      {fieldCourts[field.id].map((court) => (
                        <button
                          key={court}
                          onClick={() =>
                            handleFieldClick(field.name, field.isSchool, field.pict)
                          }
                          class="w-8 h-10 rounded-full bg-blue-100 text-blue-600 font-medium hover:bg-blue-500 hover:text-white transition"
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
    </>
  );
}

export default FieldFilterButton;
