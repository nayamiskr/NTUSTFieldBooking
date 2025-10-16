import { GoogleMap, LoadScript, OverlayView } from "@react-google-maps/api";
import { useState, useEffect } from "react";
import { RiMapPinUserFill } from "react-icons/ri";
import { IoPinSharp } from "react-icons/io5";
import { RiMapPin2Fill } from "react-icons/ri";
import "./nearbyMap.css";

function NearbyMap(type) {

    const [currentPosition, setCurrentPosition] = useState(null);
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

    return (
        <div>
            <div className="content">
                <LoadScript googleMapsApiKey={'AIzaSyBNCKN0oogWugXNw5hgo1Ml7anOAbmNfMQ'}>
                    <GoogleMap
                        mapContainerStyle={{ width: '65%', height: '400px', borderRadius: '10px' }}
                        center={currentPosition}
                        zoom={15}
                        options={
                            {
                                zoomControl: false,
                                mapTypeControl: false,
                                streetViewControl: false
                            }
                        }
                    >
                        {currentPosition && (
                            <OverlayView
                                position={currentPosition}
                                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                            >
                                <div className="location-pin">
                                    <RiMapPinUserFill />
                                </div>
                            </OverlayView>
                        )}
                        {placesWithColor.map((place) => (
                            <OverlayView
                                position={{ lat: place.lat, lng: place.lng }}
                                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                            >
                                <div
                                    className="location-pin"
                                    style={{
                                        color: place.color,
                                        WebkitTextStroke: "2px white"
                                    }}
                                >
                                    <RiMapPin2Fill />
                                </div>
                            </OverlayView>
                        ))}
                    </GoogleMap>
                </LoadScript>
                <div className="map-list">
                    <h2>附近場地</h2>
                    <ul>
                        {placesWithColor.map((place, idx) => (
                            <li key={idx}>
                                <span className="name" style={{ color: place.color }}>{place.name}</span>
                                <span className="distance">{place.distance}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );

}

export default NearbyMap;