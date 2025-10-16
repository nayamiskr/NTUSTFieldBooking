import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./fieldFilterButton.css";
import DayPicker from "./dayPick";
import NearbyMap from "./nearbyMap";
import Calendar from "./dayPick";

function FieldFilterButton() {
  const [filter, setFilter] = useState("羽球場");
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
      <div style={{width: "30%", margin: "1rem auto"}}>
        <Calendar />
      </div>
      <NearbyMap filter={filter} />
      <div className="field-filter-buttons">
        {["全部", "羽球場", "網球場", "籃球場", "排球場"].map(type => (
          <button
            key={type}
            className={filter === type ? "active" : ""}
            onClick={() => setFilter(type)}
          >
            {type}
          </button>
        ))}
      </div>
      <div className="table-wrapper">
        <table className="field-schedule-table">
          <thead>
            <tr>
              <th className="time-col">時間</th>
              {filteredFields.map(field => (
                <th key={field.id} className="field-col">{field.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, idx) => (
              <tr key={idx}>
                <td className="time-col">{slot}</td>
                {filteredFields.map(field => (
                  <td key={field.id} className="field-col">
                    <div className="field-cell" style={{ border: "1px solid #ccc", padding: "0.5rem", borderRadius: "4px" }}>
                      <div className="court-numbers" style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                        {fieldCourts[field.id]?.map(courtNum => (
                          <button key={courtNum} className="court-button"
                            onClick={() => handleFieldClick(field.name, field.isSchool, field.pict)}
                            style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}>
                            {courtNum}
                          </button>

                        ))}

                      </div>
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
