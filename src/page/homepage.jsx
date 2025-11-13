import { use, useRef } from "react";
import FieldFilterButton from "../components/fieldFilterButton";
import Navbar from "../components/navbar";
import { useLocation, useParams } from "react-router-dom";

function Homepage() {
  const { fieldType } = useParams();
  const refScroll = useRef(null);
  return (
    <div className="homepage">
        <Navbar />
        <FieldFilterButton type = {fieldType}/>
    </div>
  );
}   

export default Homepage;