import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./fieldFilterButton.css"; 

function FieldFilterButton() {
  const [filter, setFilter] = useState("全部");
  const navigate = useNavigate();
  const handleFieldClick = (fieldId) => {
    navigate(`/field/${fieldId}`);
  };

  const mockFields = [
    { id: 1, type: "羽球場", name: "羽球場一號", pict: "/field_img/badminton.jpg", desc: "這裡是介紹訊息" }, //新增所屬單位
    { id: 2, type: "網球場", name: "網球場一號", pict: "/field_img/tennis-field.png", desc: "這裡是介紹訊息" },
    { id: 5, type: "網球場", name: "網球場二號", pict: "/field_img/tennis-field.png", desc: "這裡是介紹訊息" },
    { id: 3, type: "籃球場", name: "籃球場一號", pict: "/field_img/basketball.jpg", desc: "這裡是介紹訊息" },
    { id: 4, type: "排球場", name: "排球場一號", pict: "/field_img/volleyball.jpg", desc: "這裡是介紹訊息" },
    { id: 6, type: "排球場", name: "排球場二號", pict: "/field_img/volleyball.jpg", desc: "這裡是介紹訊息" },
  ];
  //以使用者去分類可以看到的場地
  const filteredFields = filter === "全部"
    ? mockFields
    : mockFields.filter(field => field.type === filter);

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
          <div key={field.id} className="field-card" onClick={() => handleFieldClick(field.name)}>
            <img src={`${field.pict}`} alt={field.name} />
            <h3>{field.name}</h3>
            <p>{field.desc}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default FieldFilterButton;
