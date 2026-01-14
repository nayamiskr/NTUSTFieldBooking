import { GoogleMap, LoadScript, OverlayView } from "@react-google-maps/api";
import { useState, useEffect, useRef } from "react";
import { RiMapPinUserFill } from "react-icons/ri";
import { IoPinSharp } from "react-icons/io5";
import { RiMapPin2Fill } from "react-icons/ri";
import { FaSearch } from "react-icons/fa";


function NearbyMap({ filter, fields = [], onConfirmPlace = () => {} }) {

    const [currentPosition, setCurrentPosition] = useState(null);
    const mapRef = useRef(null);
    const scrollRef = useRef(null);

    const calcDistanceKm = (lat1, lng1, lat2, lng2) => {
      const R = 6371; // 地球半徑（公里）
      const toRad = (v) => (v * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    useEffect(() => {
        const saved = localStorage.getItem("currentPosition");
        if (saved) {
            setCurrentPosition(JSON.parse(saved));
        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setCurrentPosition(pos);
                localStorage.setItem("currentPosition", JSON.stringify(pos));
            }, () => {
                console.log("你拒絕定位");
            });
        }
    }, []);

    const placesFromFields = currentPosition
      ? fields.map((f, idx) => {
          const distanceKm = calcDistanceKm(
            currentPosition.lat,
            currentPosition.lng,
            f.latitude,
            f.longitude
          );

          return {
            ...f,
            lat: f.latitude,
            lng: f.longitude,
            index: idx,
            distanceKm,
            distanceText: `距離約 ${distanceKm.toFixed(2)} 公里`,
          };
        })
      : [];

    const pinColor = [
        "#E74C3C",
        "#E67E22",
        "#F1C40F",
        "#2ECC71",
        "#3498DB",
        "#0501e2ff",
        "#9B59B6",
    ];

    const getDistinctColor = (index) => pinColor[index % pinColor.length];
    const placesWithColor = placesFromFields.map((p, i) => ({
      ...p,
      color: getDistinctColor(i),
    }));

    const handleRecenter = () => {
        if (currentPosition && mapRef.current) {
            mapRef.current.panTo(currentPosition);
        }
    };

    const handleClickLocation = (idx) => {
      if (!currentPosition || !mapRef.current) return;
      const target = placesWithColor[idx];
      const newPos = {
        lat: (target.lat + currentPosition.lat) / 2,
        lng: (target.lng + currentPosition.lng) / 2,
      };
      mapRef.current.panTo(newPos);
    };

    const handleClick = (index) => {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
            if (onConfirmPlace) {
                onConfirmPlace(index);
            }
        }, 800);
    };

    const onLoad = (map) => {
        mapRef.current = map;
    };

    return (
        <div>
            <div className="map-list" >
                <ul class="flex flex-row w-auto h-5rem mb-5 overflow-x-auto snap-x snap-mandatory">
                    {placesWithColor.map((place, idx) => (
                        <li
                            key={idx}
                            class="relative flex justify-between shrink-0 max-w-[400px] h-19 snap-center text-center border rounded-xl p-2 mx-2 bg-white shadow"
                        >
                            {idx === 0 && (
                                <div class="absolute bottom-2 left-2 bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
                                    上次預約
                                </div>
                            )}
                            <span class="name" style={{ color: place.color }}>{place.name}</span>
                            <span class="distance">{place.distanceText}</span>
                            <button
                                onClick={() => handleClickLocation(idx)}
                                class="absolute bottom-2 right-20 bg-blue-400 text-white hover:bg-blue-600 text-base font-semibold px-2 py-1 rounded-md shadow"
                                title="查看位置"
                            >
                                <FaSearch />
                            </button>
                            <button
                                onClick={() => handleClick(idx)}
                                class="absolute bottom-2 right-2 bg-green-400 text-white hover:bg-green-600 text-xs font-semibold px-2 py-1 rounded-md shadow"
                                title="確認選擇"
                            >
                                確認場地
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <div class="content flex flex-col justify-center md:flex-row gap-4">
                <div class="w-full md:w-[70%] h-[350px] rounded-[10px] overflow-hidden relative">
                    <LoadScript
                        googleMapsApiKey={'AIzaSyBNCKN0oogWugXNw5hgo1Ml7anOAbmNfMQ'}
                    >
                        {currentPosition ? (
                        <GoogleMap
                            mapContainerClassName="w-full h-full rounded-[10px] shadow-lg"
                            center={currentPosition}
                            zoom={14.5}
                            options={
                                {
                                    zoomControl: false,
                                    mapTypeControl: false,
                                    streetViewControl: false,
                                    disableDefaultUI: true,
                                    styles: [
                                        {
                                            featureType: "poi",
                                            stylers: [{ visibility: "off" }]
                                        }
                                    ]
                                }
                            }
                            onLoad={onLoad}
                        >
                            {currentPosition && (
                                <OverlayView
                                    position={currentPosition}
                                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                                    getPixelPositionOffset={() => ({ x: -12, y: -24 })}
                                >
                                    <div className="text-blue-500 text-3xl drop-shadow-md">
                                        <RiMapPinUserFill />
                                    </div>
                                </OverlayView>
                            )}
                            {placesWithColor.map((place, i) => (
                                <OverlayView
                                    key={place.uuid ?? i}
                                    position={{ lat: place.lat, lng: place.lng }}
                                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                                    getPixelPositionOffset={() => ({ x: -12, y: -24 })}
                                >
                                    <div
                                        className="text-2xl drop-shadow-md"
                                        style={{
                                            color: place.color,
                                            WebkitTextStroke: "2px white"
                                        }}
                                    >
                                        <RiMapPin2Fill />
                                    </div>
                                </OverlayView>
                            ))}
                            <button
                                className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                                onClick={handleRecenter}
                                title="回到目前位置"
                            >
                                <IoPinSharp size={24} color="#333" />
                            </button>
                        </GoogleMap>) : (
                            <div class="w-full h-full flex items-center justify-center">
                                取得目前位置中...
                            </div>
                        )}
                    </LoadScript>
                </div>

            </div>
            <div ref={scrollRef}></div>
        </div>
    );

}

export default NearbyMap;