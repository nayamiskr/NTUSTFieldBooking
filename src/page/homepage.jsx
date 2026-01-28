import { useEffect, useState, useRef } from "react";
import Loading from "../components/loading";
import Navbar from "../components/navbar";
import { useParams } from "react-router-dom";
import SelectFieldSection from "../components/SelectFieldSection";
import Calendar from "../components/dayPick";
import NearbyMap from "../components/nearbyMap";
import api from "../baseApi";

function Homepage() {
  const { fieldType } = useParams();
  const { token } = useParams();
  const tableRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [filteredFields, setFilteredFields] = useState([]);
  const [confirmIdx, setConfirmIdx] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    let cancelled = false;

    const loadFields = async () => {
      setLoading(true);
      try {
        const res = await api.get("/locations");
        const filteredField = await Promise.all(
          res.data.items.map(async (loc) => {
            const resource = await api.get("/resources", {
              headers: { Authorization: `Bearer ${token}` },
              params: { location_id: loc.id, resource_type: fieldType === "all" ? undefined : fieldType }
            })

            if (resource.data.items.length === 0) return null;

            return {
              ...loc,
              resources: resource.data.items
            }
          })
        )
        if (!cancelled) {
          setFilteredFields(filteredField.filter(Boolean));
        }
      }
      catch (error) {
      }
      finally {
        if (!cancelled) {
          setLoading(false);
        }
        console.log("載入場地資料完成", filteredFields);

      }
    }
    loadFields();
  }, []);

  const handleScrollToColumn = ({ idx, place } = {}) => {
    if (idx === null || idx === undefined) return;

    setConfirmIdx({ idx, place });

    requestAnimationFrame(() => {
      tableRef.current?.scrollIntoView({ behavior: 'smooth' });
    })
  };

  return (
    <div className="homepage">
      <Navbar />
      <Loading isLoading={loading} text="載入場地資料中..." />
      <div className="flex flex-col md:flex-row justify-center items-center m-4 gap-4">
        <div className="flex text-xl font-semibold">
          預約日期 :
        </div>
        <Calendar onDayPicked={({date}) => {
          setSelectedDate(date);
        }}/>
      </div>
      {/* TODO 將確認場地按鈕加入檢視兩地功能 */}
      <NearbyMap filter={fieldType} onConfirmPlace={handleScrollToColumn} fields={filteredFields} />
      <div ref={tableRef}>
        <SelectFieldSection token={token} fields={filteredFields} fieldChecked={confirmIdx} selectedDate={selectedDate} />
      </div>
    </div>
  );
}

export default Homepage;