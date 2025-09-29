import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useState, useEffect } from "react";
import "./nearbyMap.css";

function NearbyMap() {

    const [currentPosition, setCurrentPosition] = useState(null);
    const places = [
        { name: "羽球場一號", distance: "距離約0.3公里" },
        { name: "新店國小_羽球場", distance: "距離約1.8公里" },
        { name: "新羽力_羽球場", distance: "距離約2.0公里" },
        { name: "康軒文教_羽球場", distance: "距離約2.2公里" },
        { name: "北新_羽球場", distance: "距離約2.5公里" }
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

    return (
        <div>
            <div className="content">
                <LoadScript googleMapsApiKey={'AIzaSyBNCKN0oogWugXNw5hgo1Ml7anOAbmNfMQ'}>
                    <GoogleMap
                        mapContainerStyle={{ width: '40%', height: '400px', borderRadius: '10px' }}
                        center={currentPosition || { lat: 25.017340, lng: 121.539751 }}
                        zoom={15}
                    >
                        <Marker
                            position={{lat: 24.967, lng: 121.537}}
                            icon={{iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"}}
                        />
                        <Marker
                            position={{lat: 25.0137, lng: 121.5405}}
                            icon={{iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"}}
                        />
                    </GoogleMap>
                </LoadScript>
                <div className="map-list">
                    <h2>附近場地</h2>
                    <ul>
                        {places.map((place, idx) => (
                            <li key={idx}>
                                <span className="name">{place.name}</span>
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