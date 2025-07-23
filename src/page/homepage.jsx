import FieldFilterButton from "../components/fieldFilterButton";
import Navbar from "../components/navbar";

function homepage() {
  return (
    <div className="homepage">
        <Navbar />
        <FieldFilterButton />
        <h1>歡迎來到體育場地預約系統</h1>
        <p>請選擇您要預約的場地和時間。</p>
    </div>
  );
}   

export default homepage;