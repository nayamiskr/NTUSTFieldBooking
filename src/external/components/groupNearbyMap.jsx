import { GoogleMap, useJsApiLoader, Marker, OverlayView } from '@react-google-maps/api';
import { useEffect, useRef, useState } from 'react';
import { RiMapPin2Fill, RiMapPinUserFill } from "react-icons/ri";
import { IoPinSharp } from "react-icons/io5";


const containerStyle = {
    width: "80%",
    height: "350px",
    borderRadius: "10px",
    margin: "10px auto"
}

export default function GroupNearbyMap({ groups }) {
    const [currentPosition, setCurrentPosition] = useState(() => {
        const savedPosition = localStorage.getItem('currentPosition');
        if (savedPosition) {

            return JSON.parse(savedPosition);
        }
        return { lat: 0, lng: 0 };
    });
    const mapRef = useRef(null);
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-id',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
    });

    const handleRecenter = () => {
        if (currentPosition && mapRef.current) {
            mapRef.current.panTo(currentPosition);
        }
    };

    useEffect(() => {
        if (!navigator.geolocation) return;

        // 背景偷偷去抓真實 GPS
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setCurrentPosition(newPos); // 更新到目前最新位置
                localStorage.setItem("currentPosition", JSON.stringify(newPos)); // 順便更新快取
            },
            (err) => console.warn("定位失敗", err),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    if (!isLoaded || !window.google) {
        return <div>Loading...</div>;
    }

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
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
            onLoad={(map) => mapRef.current = map}
            center={currentPosition}
        >
            {/* 顯示自己的位置 */}
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
            {groups?.map((group, index) => (
                <OverlayView
                    key={group.id || index}
                    position={{ lat: group.location.latitude, lng: group.location.longitude }}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    // 這個 offset 你可能要自己微調，讓他置中偏上，不擋到確切的座標點
                    getPixelPositionOffset={() => ({ x: -40, y: -60 })}
                >
                    <div className="flex flex-col items-center cursor-pointer group relative z-10 hover:z-50">
                        {/* 資訊框 */}
                        <div className="bg-white px-2 py-1 rounded shadow-md text-xs font-bold text-gray-800 whitespace-nowrap mb-1 border border-gray-200 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-300">
                            {group.title} ({group.current_enrolled || 0}/{group.capacity || 0}人)
                        </div>
                        {/* 圖標 */}
                        <div className="text-3xl text-red-500 drop-shadow-md rounded-full flex items-center justify-center">
                            <RiMapPin2Fill />
                        </div>
                    </div>
                </OverlayView>
            ))}
            {/* 回到目前位置按鈕 */}
            <button
                className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                onClick={handleRecenter}
                title="回到目前位置"
            >
                <IoPinSharp size={24} color="#333" />
            </button>
        </GoogleMap>
    );
}