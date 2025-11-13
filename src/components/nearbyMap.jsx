import { GoogleMap, LoadScript, OverlayView } from "@react-google-maps/api";
import { useState, useEffect, useRef } from "react";
import { RiMapPinUserFill } from "react-icons/ri";
import { IoPinSharp } from "react-icons/io5";
import { RiMapPin2Fill } from "react-icons/ri";
import { FaSearch } from "react-icons/fa";


function NearbyMap({ filter, onConfirmPlace = () => { } }) {

    const [currentPosition, setCurrentPosition] = useState(null);
    const mapRef = useRef(null);
    const scrollRef = useRef(null);

    const places = [
        { name: "羽球場一號", type: "羽球場", lat: 25.0137, lng: 121.5405, distance: "距離約0.3公里" },
        { name: "新羽力_羽球場", type: "羽球場", lat: 25.02437, lng: 121.5505, distance: "距離約1.0公里" },
        { name: "北新_羽球場", type: "羽球場", lat: 25.02437, lng: 121.5805, distance: "距離約2.2公里" },
        { name: "新店國小_羽球場", type: "羽球場", lat: 24.967, lng: 121.537, distance: "距離約2.8公里" },
        { name: "康軒文教_羽球場", type: "羽球場", lat: 24.95437, lng: 121.5205, distance: "距離約3.2公里" },
    ];

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setCurrentPosition(pos);
            }, () => {
                console.log("你拒絕定位");
            });
        }
    }, []);

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
    const placesWithColor = places.map((p, i) => ({ ...p, color: getDistinctColor(i) }));

    const handleRecenter = () => {
        if (currentPosition && mapRef.current) {
            mapRef.current.panTo(currentPosition);
        }
    };

    const handleClickLocation = (idx) => {
        const newPos = { lat: (placesWithColor[idx].lat + currentPosition.lat) / 2, lng: (placesWithColor[idx].lng + currentPosition.lng) / 2 };
        mapRef.current.panTo(newPos);
    }

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
                <h2 className="text-2xl mb-5">附近場地</h2>
                <ul className="flex flex-row gap-1 w-auto h-19 mb-5 overflow-x-auto snap-x snap-mandatory md:justify-center">
                    {placesWithColor.map((place, idx) => (
                        <li
                            key={idx}
                            className="relative flex justify-between shrink-0 max-w-[400px] snap-center text-center border rounded-xl p-2 mx-2 bg-white shadow"
                        >
                            {idx === 0 && (
                                <div className="absolute bottom-2 left-2 bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
                                    上次預約
                                </div>
                            )}
                            <span className="name" style={{ color: place.color }}>{place.name}</span>
                            <span className="distance">{place.distance}</span>
                            <button
                                onClick={() => handleClickLocation(idx)}
                                className="absolute bottom-2 right-20 bg-blue-400 text-white hover:bg-blue-600 text-base font-semibold px-2 py-1 rounded-md shadow"
                                title="查看位置"
                            >
                                <FaSearch />
                            </button>
                            <button
                                onClick={() => handleClick(idx)}
                                className="absolute bottom-2 right-2 bg-green-400 text-white hover:bg-green-600 text-xs font-semibold px-2 py-1 rounded-md shadow"
                                title="確認選擇"
                            >
                                確認場地
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="content flex flex-col justify-center md:flex-row gap-4">
                <div className="w-full md:w-[70%] h-[400px] rounded-[10px] overflow-hidden relative">
                    <LoadScript googleMapsApiKey={'AIzaSyBNCKN0oogWugXNw5hgo1Ml7anOAbmNfMQ'}>
                        <GoogleMap
                            mapContainerClassName="w-full h-full rounded-[10px] shadow-lg"
                            center={currentPosition}
                            zoom={15}
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
                                    key={i}
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
                        </GoogleMap>
                    </LoadScript>
                </div>

            </div>
            <div ref={scrollRef}></div>
        </div>
    );

}

export default NearbyMap;