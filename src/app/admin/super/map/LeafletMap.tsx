'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Building2 } from 'lucide-react';

// Handle React-Leaflet missing icon bug
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function LeafletMap({ temples }: { temples: any[] }) {
   // Default map center set to Athens, Greece
   const defaultCenter: [number, number] = [37.9838, 23.7275];
   
   return (
      <MapContainer 
        center={defaultCenter} 
        zoom={6} 
        scrollWheelZoom={true} 
        style={{ height: "600px", width: "100%", borderRadius: "0.75rem", zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {temples.map((t: any) => {
            if (t.lat && t.lng) {
                return (
                 <Marker key={t.id} position={[t.lat, t.lng]} icon={customIcon}>
                   <Popup className="rounded-xl overflow-hidden shadow-sm">
                     <div className="font-sans min-w-[200px]">
                        <strong className="text-[var(--brand)] block text-base leading-tight mb-1">{t.name}</strong>
                        <span className="text-[var(--text-secondary)] font-medium text-xs block mb-2">{t.metropolis || '—'}</span>
                        <hr className="my-2 border-[var(--border)]"/>
                        <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                            📍 {t.city || 'Άγνωστη Πόλη'}
                        </span>
                        <div className="mt-2 text-[10px] font-black uppercase px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md inline-block">
                           {t.subscriptionPlan || 'Free'}
                        </div>
                     </div>
                   </Popup>
                 </Marker>
               )
            }
            return null;
        })}
      </MapContainer>
   );
}
