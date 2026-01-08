import FieldFilterButton from "../components/fieldFilterButton";
import Navbar from "../components/navbar";
import {  useParams } from "react-router-dom";

function Homepage() {
  const { fieldType } = useParams();
  return (
    <div className="homepage">
        <Navbar />
        <FieldFilterButton type = {fieldType}/>
    </div>
  );
}   

export default Homepage;