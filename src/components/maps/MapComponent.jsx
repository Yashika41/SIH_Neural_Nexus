import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useStore } from '../../store/useStore.js';

export default function MapComponent({ activeTab = 'overview' }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const routesLayer = useRef(null);
  const incidentsLayer = useRef(null);
  const ordersLayer = useRef(null);

  const selectedOrder = useStore((state) => state.selectedOrder);
  const activeRouteOptions = useStore((state) => state.activeRouteOptions);
  const selectedRouteId = useStore((state) => state.selectedRouteId);
  const incidents = useStore((state) => state.incidents);
  const setSelectedRouteId = useStore((state) => state.setSelectedRouteId);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = L.map(mapContainer.current, {
      center: [25.5788, 91.8833], // Shillong Default
      zoom: 13,
      zoomControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map.current);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map.current);

    routesLayer.current = L.layerGroup().addTo(map.current);
    incidentsLayer.current = L.layerGroup().addTo(map.current);
    ordersLayer.current = L.layerGroup().addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Render Incidents
  useEffect(() => {
    if (!incidentsLayer.current) return;
    incidentsLayer.current.clearLayers();

    incidents.forEach((inc) => {
      const icon = L.divIcon({
        html: `
          <div class="flex items-center justify-center w-7 h-7 rounded-full bg-rose-600 border-2 border-white shadow-md text-white font-extrabold text-xs">
            ⚠
          </div>
        `,
        className: 'custom-leaflet-marker-dest',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      L.marker([inc.coords.lat, inc.coords.lng], { icon })
        .bindPopup(`<b>${inc.type}</b><br/>${inc.locationName}<br/>Severity: ${inc.severity}`)
        .addTo(incidentsLayer.current);
    });
  }, [incidents]);

  // Render Order Markers & Polylines
  useEffect(() => {
    if (!ordersLayer.current || !routesLayer.current) return;

    ordersLayer.current.clearLayers();
    routesLayer.current.clearLayers();

    if (selectedOrder) {
      // Pickup Marker P
      const pIcon = L.divIcon({
        html: `<div class="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs border-2 border-white shadow">P</div>`,
        className: 'custom-leaflet-marker-pickup',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      L.marker([selectedOrder.pickupCoords.lat, selectedOrder.pickupCoords.lng], { icon: pIcon })
        .bindPopup(`<b>Pickup: ${selectedOrder.pickup}</b>`)
        .addTo(ordersLayer.current);

      // Destination Marker D
      const dIcon = L.divIcon({
        html: `<div class="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs border-2 border-white shadow">D</div>`,
        className: 'custom-leaflet-marker-dest',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      L.marker([selectedOrder.destinationCoords.lat, selectedOrder.destinationCoords.lng], { icon: dIcon })
        .bindPopup(`<b>Destination: ${selectedOrder.destination}</b>`)
        .addTo(ordersLayer.current);
    }

    // Render Routes
    if (activeRouteOptions.length > 0 && map.current) {
      const boundsPoints = [];

      activeRouteOptions.forEach((ro) => {
        const isSelected = ro.id === selectedRouteId;
        const color = isSelected ? '#6366f1' : '#94a3b8';
        const weight = isSelected ? 6 : 3;

        const points = ro.path.map(p => [p.lat, p.lng]);
        points.forEach(pt => boundsPoints.push(pt));

        const line = L.polyline(points, {
          color,
          weight,
          opacity: isSelected ? 0.95 : 0.5,
          lineJoin: 'round'
        })
          .bindPopup(`<b>${ro.name}</b>${isSelected ? ' (RECOMMENDED)' : ''}<br/>ETA: ${ro.eta} min | Dist: ${ro.distance} km`)
          .addTo(routesLayer.current);

        line.on('click', () => setSelectedRouteId(ro.id));

        // Add Midpoint Badge
        if (points.length > 2) {
          const midPt = points[Math.floor(points.length / 2)];
          const badgeIcon = L.divIcon({
            html: `
              <div class="px-2 py-0.5 bg-white border border-slate-300 rounded shadow text-[10px] font-bold text-slate-800 flex items-center gap-1 whitespace-nowrap">
                <span>${ro.eta} min (${ro.distance} km)</span>
                ${isSelected ? '<span class="text-indigo-600 font-extrabold">★ Recommended</span>' : ''}
              </div>
            `,
            className: 'custom-leaflet-route-badge',
            iconSize: [120, 20],
            iconAnchor: [60, 10]
          });

          L.marker(midPt, { icon: badgeIcon })
            .on('click', () => setSelectedRouteId(ro.id))
            .addTo(routesLayer.current);
        }
      });

      if (selectedOrder) {
        boundsPoints.push([selectedOrder.pickupCoords.lat, selectedOrder.pickupCoords.lng]);
        boundsPoints.push([selectedOrder.destinationCoords.lat, selectedOrder.destinationCoords.lng]);
      }

      if (boundsPoints.length > 0) {
        map.current.fitBounds(L.latLngBounds(boundsPoints), { padding: [50, 50] });
      }
    }
  }, [selectedOrder, activeRouteOptions, selectedRouteId]);

  return (
    <div className="relative w-full h-full min-h-[350px] rounded-xl overflow-hidden shadow-inner border border-slate-200">
      <div ref={mapContainer} className="w-full h-full z-10" />
    </div>
  );
}
