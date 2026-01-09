import FieldFilterButton from "../components/fieldFilterButton";
import Navbar from "../components/navbar";
import {  useParams } from "react-router-dom";

function Homepage() {
  const { fieldType } = useParams();
  const { token } = useParams();
  return (
    <div className="homepage">
        <Navbar />
        <FieldFilterButton type = {fieldType} token = {token}/>
    </div>
  );
}   

export default Homepage;