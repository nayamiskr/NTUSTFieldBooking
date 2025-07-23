import { useState } from "react";

function FieldFilterButton() {
  const [filter, setFilter] = useState("全部");

  const allFields = [
    { id: 1, type: "羽球場", name: "羽球場一號", desc: "這裡是介紹訊息" },
    { id: 2, type: "網球場", name: "網球場一號", desc: "這裡是介紹訊息" },
    { id: 3, type: "籃球場", name: "籃球場一號", desc: "這裡是介紹訊息" },
    { id: 4, type: "排球場", name: "排球場一號", desc: "這裡是介紹訊息" },
    { id: 5, type: "網球場", name: "網球場二號", desc: "這裡是介紹訊息" },
  ];

  const filteredFields = filter === "全部"
    ? allFields
    : allFields.filter(field => field.type === filter);

  return (
    <>
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

      <div className="field-card-container">
        {filteredFields.map(field => (
          <div key={field.id} className="field-card">
            <h3>{field.name}</h3>
            <p>{field.desc}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default FieldFilterButton;
