import {
    Droplet, ShowerHead, Shirt, Users, RestRoom,
    LampCeiling, Volleyball, AirVent, Wifi, BriefcaseMedical, Accessibility
} from "lucide-react";
import { FaRestroom } from "react-icons/fa";

export const facilityMap = {
    waterdis: { name: '飲水機', icon: <Droplet /> },
    showerRoom: { name: '淋浴間', icon: <ShowerHead /> },
    lockerRoom: { name: '更衣室', icon: <Shirt /> },
    restRoom: { name: '廁所', icon: <FaRestroom /> },
    lighting: { name: '照明設備', icon: <LampCeiling /> },
    equipmentRental: { name: '器材租借', icon: <Volleyball /> },
    airconditioner: { name: '冷氣', icon: <AirVent /> },
    wifi: { name: '網路', icon: <Wifi /> },
    firstAid: { name: '急救設施', icon: <BriefcaseMedical /> },
    accessible: { name: '無障礙設施', icon: <Accessibility /> }
};