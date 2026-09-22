import {
  Droplet,
  ShowerHead,
  Shirt,
  Users,
  LampCeiling,
  Volleyball,
  AirVent,
  Wifi,
  BriefcaseMedical,
  Accessibility,
  MapPinned,
  Clock2,
  Eye,
  EyeOff,
  SlidersHorizontal,
  SquareParking,
  rotateCw,
} from "lucide-react";
import {
  MdSportsBasketball,
  MdSportsVolleyball,
  MdSportsTennis,
  MdSportsSoccer,
  MdSportsBaseball,
} from "react-icons/md";

import { GiShuttlecock } from "react-icons/gi";
import { FaRestroom, FaPlus } from "react-icons/fa";

export const facilityMap = {
  waterdis: { name: "飲水機", icon: <Droplet /> },
  showerRoom: { name: "淋浴間", icon: <ShowerHead /> },
  lockerRoom: { name: "更衣室", icon: <Shirt /> },
  restRoom: { name: "廁所", icon: <FaRestroom /> },
  lighting: { name: "照明設備", icon: <LampCeiling /> },
  equipmentRental: { name: "器材租借", icon: <Volleyball /> },
  airconditioner: { name: "冷氣", icon: <AirVent /> },
  wifi: { name: "網路", icon: <Wifi /> },
  firstAid: { name: "急救設施", icon: <BriefcaseMedical /> },
  accessible: { name: "無障礙設施", icon: <Accessibility /> },
  parking: { name: "停車場", icon: <SquareParking /> },
};

export const functionIconMap = {
  add: { name: "新增", icon: <FaPlus /> },
  refresh: { name: "重新整理", icon: <rotateCw /> },
  show: { name: "顯示", icon: <Eye /> },
  hide: { name: "隱藏", icon: <EyeOff /> },
  filter: { name: "篩選", icon: <SlidersHorizontal /> },
};

export const InfoIconMap = {
  location: { name: "地點", icon: <MapPinned /> },
  host: { name: "主辦人", icon: <Users /> },
  time: { name: "時間", icon: <Clock2 /> },
};

export const sportIconMap = {
  BASEBALL: { name: "棒球", icon: <MdSportsBaseball /> },
  VOLLEYBALL: { name: "排球", icon: <MdSportsVolleyball /> },
  BADMINTON: { name: "羽球", icon: <GiShuttlecock /> },
  TENNIS: { name: "網球", icon: <MdSportsTennis /> },
  SOCCER: { name: "足球", icon: <MdSportsSoccer /> },
  BASKETBALL: { name: "籃球", icon: <MdSportsBasketball /> },
};
