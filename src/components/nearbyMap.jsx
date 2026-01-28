import { GoogleMap, LoadScript, OverlayView } from "@react-google-maps/api";
import { useState, useEffect, useRef, useMemo } from "react";
import { RiMapPinUserFill } from "react-icons/ri";
import { IoPinSharp } from "react-icons/io5";
import { RiMapPin2Fill } from "react-icons/ri";
import { FaSearch } from "react-icons/fa";


function NearbyMap({ filter, fields = [], onConfirmPlace = () => { } }) {

  const [currentPosition, setCurrentPosition] = useState(null);
  const mapRef = useRef(null);
  const scrollRef = useRef(null);
  const [focusedPlaceIdx, setFocusedPlaceIdx] = useState(null);
  const [mapsLoadError, setMapsLoadError] = useState(null);
  const [selectedPlaceIdx, setSelectedPlaceIdx] = useState(null);

  const calcDistanceKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
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
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.lat === "number" && typeof parsed.lng === "number") {
          setCurrentPosition(parsed);
        }
      } catch (_) {}
    }

    if (!navigator.geolocation) {
      console.warn("此瀏覽器不支援 geolocation");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log("定位成功:", pos);
        setCurrentPosition(pos);
        localStorage.setItem("currentPosition", JSON.stringify(pos));
      },
      (err) => {
        console.warn("定位失敗:", err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const placesFromFields = currentPosition
    ? fields
      .map((f, idx) => {
        const lat = Number(f.latitude);
        const lng = Number(f.longitude);
        return {
          ...f,
          id: f.id,
          lat,
          lng,
          index: idx,
        };
      })
      .filter((f) => Number.isFinite(f.lat) && Number.isFinite(f.lng))
      .map((f, idx) => {
        const distanceKm = calcDistanceKm(
          currentPosition.lat,
          currentPosition.lng,
          f.lat,
          f.lng
        );

        return {
          ...f,
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
  const placesWithColor = useMemo(
    () => placesFromFields.map((p, i) => ({ ...p, color: getDistinctColor(i) })),
    [placesFromFields]
  );

  const handleRecenter = () => {
    if (currentPosition && mapRef.current) {
      mapRef.current.panTo(currentPosition);
      setFocusedPlaceIdx(null);
    }
  };

  const fitBoundsToPoints = (points) => {
    if (!mapRef.current || !points || points.length === 0) return;
    if (!window.google?.maps) return;

    const bounds = new window.google.maps.LatLngBounds();
    points.forEach((p) => bounds.extend(p));

    mapRef.current.fitBounds(bounds, {
      top: 80,
      bottom: 80,
      left: 80,
      right: 80,
    });
  };

  const handleClickLocation = (idx) => {
    if (!currentPosition || !mapRef.current) return;
    const target = placesWithColor[idx];
    if (!target) return;

    setFocusedPlaceIdx(idx);

    fitBoundsToPoints([
      currentPosition,
      { lat: target.lat, lng: target.lng },
    ]);

  };

  const handleClick = (idx) => {
    if (!currentPosition || !mapRef.current) return;

    const target = placesWithColor[idx];
    if (!target) return;
    setSelectedPlaceIdx(idx);
    setFocusedPlaceIdx(idx);

    fitBoundsToPoints([
      currentPosition, 
      { lat: target.lat, lng: target.lng },
    ])
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });

    const selectedPlace = placesWithColor[idx] ?? null;

    if (onConfirmPlace) {
      onConfirmPlace({ idx, place: selectedPlace });
    }
  };

  const onLoad = (map) => {
    mapRef.current = map;

    if (currentPosition && placesWithColor.length > 0) {
      fitBoundsToPoints([
        currentPosition,
        ...placesWithColor.map((p) => ({ lat: p.lat, lng: p.lng })),
      ]);
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;
    if (!currentPosition) return;
    if (placesWithColor.length === 0) return;

    fitBoundsToPoints([
      currentPosition,
      ...placesWithColor.map((p) => ({ lat: p.lat, lng: p.lng })),
    ]);
  }, [currentPosition, placesWithColor.length]);

  return (
    <div>
      <div className="map-list md:mx-18" >
        <ul className="flex flex-row w-auto h-5rem mb-5 gap-3 overflow-x-auto snap-x snap-mandatory">
          {placesWithColor.map((place, idx) => (
            <li
              key={idx}
              className={`relative flex justify-between shrink-0 max-w-[400px] h-19 snap-center text-center border rounded-xl p-2 shadow ${selectedPlaceIdx === idx ? "bg-green-50 border-green-400" : "bg-white"}`}
            >
              {idx === 0 && (
                <div className="absolute bottom-2 left-2 bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
                  上次預約
                </div>
              )}
              <span className="name" style={{ color: place.color }}>{place.name}</span>
              <span className="distance">{place.distanceText}</span>
              <button
                onClick={() => handleClickLocation(idx)}
                className="absolute bottom-2 right-20 bg-blue-400 text-white hover:bg-blue-600 text-base font-semibold px-2 py-1 rounded-md shadow"
                title="查看位置"
              >
                <FaSearch />
              </button>
              <button
                onClick={() => handleClick(idx)}
                className={`absolute bottom-2 right-2 text-xs font-semibold px-2 py-1 rounded-md shadow ${selectedPlaceIdx === idx ? "bg-gray-400 cursor-default text-white" : "bg-green-400 text-white hover:bg-green-600"}`}
                title="確認選擇"
                disabled={selectedPlaceIdx === idx}
              >
                {selectedPlaceIdx === idx ? "已選擇" : "確認場地"}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="content flex flex-col justify-center md:flex-row gap-4">
        <div className="w-full md:w-[90%] h-[350px] rounded-[10px] overflow-hidden relative">
          <LoadScript
            googleMapsApiKey={'AIzaSyBNCKN0oogWugXNw5hgo1Ml7anOAbmNfMQ'}
            onError={(e) => {
              console.error("Google Maps script 載入失敗:", e);
              setMapsLoadError("Google Maps script 載入失敗（請看 Console / Network）");
            }}
            onLoad={() => {
              console.log("Google Maps script 已載入", !!window.google?.maps);
            }}
          >
            {currentPosition ? (
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
                onUnmount={() => { mapRef.current = null; }}
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
                    key={place.id ?? i}
                    position={{ lat: place.lat, lng: place.lng }}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    getPixelPositionOffset={() => ({ x: -12, y: -24 })}
                  >
                    <div
                      className="text-2xl drop-shadow-md"
                      style={{
                        color: place.color,
                        WebkitTextStroke: "2px white",
                        transform:
                          focusedPlaceIdx === null
                            ? "scale(1)"
                            : i === focusedPlaceIdx
                              ? "scale(1)"
                              : "scale(0.6)",
                        transformOrigin: "center",
                        transition: "transform 200ms ease",
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
              </GoogleMap>) : mapsLoadError ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-red-600 p-4 text-center">
                  {mapsLoadError}
                </div>
              ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-600">
                正在取得目前位置...
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