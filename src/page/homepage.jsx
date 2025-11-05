import { use } from "react";
import FieldFilterButton from "../components/fieldFilterButton";
import Navbar from "../components/navbar";
import { useLocation } from "react-router-dom";

function homepage() {
  return (
    <div className="homepage">
        <Navbar />
        <FieldFilterButton/>
        
    </div>
  );
}   

export default homepage;