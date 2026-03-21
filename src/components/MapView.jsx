import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { CITIES } from '../data/mockOpportunities';
import ConfidenceBadge from './ConfidenceBadge';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function createCustomIcon(score) {
  const color = score >= 85 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 32px; height: 32px;
      background: ${color};
      border: 3px solid rgba(17, 19, 24, 0.9);
      box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 12px rgba(0,0,0,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: white;
      font-family: 'Inter', sans-serif;
    ">${score}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 });
  }, [center, zoom, map]);
  return null;
}

export default function MapView({ opportunities, selectedCity, onSelectOpportunity, selectedOpportunity }) {
  const city = CITIES.find((c) => c.id === selectedCity) || CITIES[0];
  const center = [city.lat, city.lng];

  return (
    <div className="map-view">
      <MapContainer
        center={center}
        zoom={12}
        className="map-view__container"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapUpdater center={center} zoom={12} />
        {opportunities.filter(opp => opp.latitude != null && opp.longitude != null).map((opp) => (
          <Marker
            key={opp.id}
            position={[opp.latitude, opp.longitude]}
            icon={createCustomIcon(opp.confidence_score)}
            eventHandlers={{
              click: () => onSelectOpportunity?.(opp),
            }}
          >
            <Popup className="map-popup">
              <div className="map-popup__content">
                <div className="map-popup__title">{opp.title}</div>
                <div className="map-popup__address">{opp.address}</div>
                <div className="map-popup__badges">
                  <ConfidenceBadge score={opp.confidence_score} />
                </div>
                <div className="map-popup__type">{opp.permit_type}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
