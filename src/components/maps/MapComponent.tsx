'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useStore } from '../../store/useStore';
import { LatLng, RouteOption, Vehicle, Incident, AccessibilityFeature } from '../../types';
import { calculateHaversineDistance } from '../../services/aiServices';

interface MapComponentProps {
  viewMode?: 'standard' | 'accessibility' | 'terrain' | 'operations';
}

export default function MapComponent({ viewMode = 'standard' }: MapComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Store state
  const vehicles = useStore((state) => state.vehicles);
  const orders = useStore((state) => state.orders);
  const incidents = useStore((state) => state.incidents);
  const accessibilityFeatures = useStore((state) => state.accessibilityFeatures);
  const zones = useStore((state) => state.zones);
  const activeRouteOptions = useStore((state) => state.activeRouteOptions);
  const selectedRouteId = useStore((state) => state.selectedRouteId);
  const selectedOrder = useStore((state) => state.selectedOrder);
  const selectedVehicle = useStore((state) => state.selectedVehicle);
  const activeTab = useStore((state) => state.activeTab);

  // Layer groups refs
  const vehiclesLayer = useRef<L.LayerGroup | null>(null);
  const ordersLayer = useRef<L.LayerGroup | null>(null);
  const incidentsLayer = useRef<L.LayerGroup | null>(null);
  const accessibilityLayer = useRef<L.LayerGroup | null>(null);
  const routesLayer = useRef<L.LayerGroup | null>(null);
  const zonesLayer = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Center on Shillong, Meghalaya
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true
    }).setView([25.5788, 91.8833], 13);

    // Standard OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Create Layer Groups
    vehiclesLayer.current = L.layerGroup().addTo(map);
    ordersLayer.current = L.layerGroup().addTo(map);
    incidentsLayer.current = L.layerGroup().addTo(map);
    accessibilityLayer.current = L.layerGroup().addTo(map);
    routesLayer.current = L.layerGroup().addTo(map);
    zonesLayer.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    // Add map click listener to copy coordinates for user convenience
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      // Copy to clipboard or broadcast coordinate event
      const coordsStr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      console.log('Clicked map coords:', coordsStr);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update map layout based on tab and selections
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Redraw zones heatmap (if accessibility/terrain tab is active)
    if (zonesLayer.current) {
      zonesLayer.current.clearLayers();
      if (activeTab === 'accessMap' || activeTab === 'riskMap' || activeTab === 'regional') {
        zones.forEach((z) => {
          // Approximate centers for zones
          let center: [number, number] = [25.5788, 91.8833];
          if (z.id === 'Z-1') center = [25.5728, 91.8785]; // PB
          else if (z.id === 'Z-2') center = [25.5648, 91.8932]; // LK/Malki
          else if (z.id === 'Z-3') center = [25.5991, 91.8762]; // Mawlai
          else if (z.id === 'Z-4') center = [25.5658, 91.9146]; // Nongthymmai/Rynjah
          else if (z.id === 'Z-5') center = [25.5392, 91.8493]; // Upper Shillong
          else if (z.id === 'Z-6') center = [25.6075, 91.9080]; // NEHU/Mawpat

          let fillColor = '#9ca3af'; // gray
          let fillOpacity = 0.15;
          let label = z.name;

          if (activeTab === 'accessMap') {
            // Color based on accessibility score
            if (z.accessibilityScore >= 80) fillColor = '#10b981'; // green
            else if (z.accessibilityScore >= 60) fillColor = '#eab308'; // yellow
            else fillColor = '#f43f5e'; // red
            
            // If unknown/low confidence, represent visually
            if (z.confidenceScore < 50) {
              fillColor = '#6b7280'; // gray
              fillOpacity = 0.25;
            }
          } else if (activeTab === 'riskMap') {
            // Color based on terrain risk
            if (z.terrainRisk >= 60) fillColor = '#f43f5e'; // red
            else if (z.terrainRisk >= 35) fillColor = '#f97316'; // orange
            else fillColor = '#10b981'; // green
          }

          L.circle(center, {
            radius: 800,
            color: fillColor,
            weight: 1,
            fillColor,
            fillOpacity,
            dashArray: z.confidenceScore < 50 ? '5, 5' : undefined
          })
            .bindPopup(`<b>${label}</b><br/>Accessibility Score: ${z.accessibilityScore}/100<br/>Terrain Risk: ${z.terrainRisk}/100<br/>Confidence Score: ${z.confidenceScore}%<br/>Challenge: ${z.primaryChallenge}`)
            .addTo(zonesLayer.current!);
        });
      }
    }

    // Redraw Incidents
    if (incidentsLayer.current) {
      incidentsLayer.current.clearLayers();
      const activeRoute = activeRouteOptions.find(r => r.id === selectedRouteId) || activeRouteOptions[0];

      incidents.forEach((inc) => {
        if (inc.status === 'Resolved') return;

        // Corridor check in routing tab to focus on relevant incidents
        if (activeTab === 'routing' && activeRoute) {
          const isNear = activeRoute.path.some(p => calculateHaversineDistance(inc.coords, p) < 0.8);
          if (!isNear) return;
        }

        // Custom div icon for incident
        let color = '#ef4444'; // red
        let pulse = 'animate-ping';
        if (inc.severity === 'Moderate') {
          color = '#f97316'; // orange
          pulse = '';
        }

        const iconHtml = `
          <div class="relative flex items-center justify-center w-8 h-8 rounded-full border border-white shadow-md bg-white">
            <span class="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 ${pulse}"></span>
            <div class="w-6 h-6 rounded-full flex items-center justify-center" style="background-color: ${color}">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        `;

        const markerIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-leaflet-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        L.marker([inc.coords.lat, inc.coords.lng], { icon: markerIcon })
          .bindPopup(`
            <div class="p-1">
              <h3 class="font-bold text-red-600">${inc.type.toUpperCase()}</h3>
              <p class="text-xs text-gray-500 font-semibold">Severity: ${inc.severity} | Source: ${inc.source}</p>
              <p class="text-xs mt-1 font-medium text-gray-700">${inc.description}</p>
              <p class="text-[10px] text-gray-400 mt-1">${new Date(inc.reportedTime).toLocaleTimeString()}</p>
            </div>
          `)
          .addTo(incidentsLayer.current!);
      });
    }

    // Redraw Accessibility Features
    if (accessibilityLayer.current) {
      accessibilityLayer.current.clearLayers();
      if (activeTab === 'accessMap' || activeTab === 'overview' || activeTab === 'routing' || activeTab === 'feedback') {
        const activeRoute = activeRouteOptions.find(r => r.id === selectedRouteId) || activeRouteOptions[0];

        accessibilityFeatures.forEach((feat) => {
          if (feat.verifiedStatus === 'Rejected') return;

          // Corridor check in routing tab to focus on relevant features
          if (activeTab === 'routing' && activeRoute) {
            const isNear = activeRoute.path.some(p => calculateHaversineDistance(feat.coords, p) < 0.8);
            if (!isNear) return;
          }

          let color = '#10b981'; // green for positive/accessible
          let svgPath = '';

          // Ramps & wheelchair accessible are green. Barriers, steep slope, stairs are orange/red.
          if (feat.type === 'stairs') {
            color = '#ef4444'; // red
            svgPath = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h4v4h4v4h4v4h4v4" />';
          } else if (feat.type === 'steep slope') {
            color = '#f97316'; // orange
            svgPath = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />';
          } else if (feat.type === 'poor surface') {
            color = '#f59e0b'; // amber
            svgPath = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />';
          } else if (feat.type === 'temporary obstruction') {
            color = '#dc2626'; // dark red
            svgPath = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />';
          } else if (feat.type === 'ramp') {
            svgPath = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />';
          } else if (feat.type === 'wheelchair accessible') {
            svgPath = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />';
          } else {
            // Accessible crossing or standard
            svgPath = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />';
          }

          const iconHtml = `
            <div class="flex items-center justify-center w-6 h-6 rounded-full border border-white shadow-sm bg-white" style="color: ${color}">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                ${svgPath}
              </svg>
            </div>
          `;

          const markerIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-leaflet-marker-access',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          L.marker([feat.coords.lat, feat.coords.lng], { icon: markerIcon })
            .bindPopup(`
              <div class="p-1">
                <h4 class="font-bold text-gray-900">${feat.locationName}</h4>
                <p class="text-xs text-gray-500 font-semibold capitalize">${feat.type} | Conf: ${feat.confidence}%</p>
                <p class="text-xs mt-1 text-gray-600">${feat.description}</p>
                <div class="mt-2 flex items-center justify-between gap-2">
                  <span class="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">${feat.verifiedStatus}</span>
                  <span class="text-[10px] text-gray-400">Reports: ${feat.reportsCount}</span>
                </div>
              </div>
            `)
            .addTo(accessibilityLayer.current!);
        });
      }
    }

    // Redraw Vehicles
    if (vehiclesLayer.current) {
      vehiclesLayer.current.clearLayers();
      vehicles.forEach((veh) => {
        let color = '#3b82f6'; // blue - Available
        if (veh.status === 'Delivering') color = '#a855f7'; // purple
        else if (veh.status === 'Delayed') color = '#ef4444'; // red
        else if (veh.status === 'Offline') color = '#6b7280'; // gray
        else if (veh.status === 'Maintenance') color = '#f59e0b'; // amber

        let symbol = '🚚';
        if (veh.type === 'Delivery Bike') symbol = '🏍️';
        else if (veh.type === 'Accessible Mobility Vehicle') symbol = '♿';
        else if (veh.type === '4x4 Utility Vehicle') symbol = '🚙';

        const isPulse = veh.status === 'Delivering';

        const iconHtml = `
          <div class="relative flex items-center justify-center w-8 h-8 rounded-full border border-white shadow-md bg-white">
            ${isPulse ? `<span class="absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75 animate-ping"></span>` : ''}
            <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs" style="background-color: ${color}">
              <span class="text-white scale-95">${symbol}</span>
            </div>
          </div>
        `;

        const markerIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-leaflet-marker-vehicle',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        L.marker([veh.lat, veh.lng], { icon: markerIcon })
          .bindPopup(`
            <div class="p-1">
              <h3 class="font-bold text-gray-900">${veh.name}</h3>
              <p class="text-xs text-gray-500 font-semibold">${veh.type} | Driver: ${veh.driverName}</p>
              <p class="text-xs font-semibold mt-1" style="color: ${color}">Status: ${veh.status}</p>
              <div class="grid grid-cols-2 gap-1 text-[10px] text-gray-600 mt-2 border-t pt-1">
                <span>Charge: ${veh.fuelCharge}%</span>
                <span>Cap: ${veh.capacity} kg</span>
                <span>Hill Suit: ${veh.hillSuitability}</span>
                <span>Clearance: ${veh.groundClearance}mm</span>
              </div>
            </div>
          `)
          .addTo(vehiclesLayer.current!);
      });
    }

    // Redraw Orders & Selected Order Markers
    if (ordersLayer.current) {
      ordersLayer.current.clearLayers();

      const ordersToDraw = [...orders];
      if (selectedOrder && !ordersToDraw.some(o => o.id === selectedOrder.id)) {
        ordersToDraw.push(selectedOrder);
      }

      ordersToDraw.forEach((ord) => {
        if (ord.status === 'Delivered') return;

        // Pickup Marker
        const pickupIcon = L.divIcon({
          html: `
            <div class="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white shadow bg-emerald-500">
              <span class="text-white text-[10px] font-bold">P</span>
            </div>
          `,
          className: 'custom-leaflet-marker-pickup',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        L.marker([ord.pickupCoords.lat, ord.pickupCoords.lng], { icon: pickupIcon })
          .bindPopup(`<b>Pickup Location</b><br/>${ord.pickup}<br/>Order: ${ord.id}`)
          .addTo(ordersLayer.current!);

        // Destination Marker
        const destIcon = L.divIcon({
          html: `
            <div class="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white shadow bg-indigo-600">
              <span class="text-white text-[10px] font-bold">D</span>
            </div>
          `,
          className: 'custom-leaflet-marker-dest',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        L.marker([ord.destinationCoords.lat, ord.destinationCoords.lng], { icon: destIcon })
          .bindPopup(`<b>Destination Location</b><br/>${ord.destination}<br/>Order: ${ord.id}`)
          .addTo(ordersLayer.current!);
      });
    }

    // Draw Routes & snapping links
    if (routesLayer.current) {
      routesLayer.current.clearLayers();

      // Draw all options if in routing view
      if (activeTab === 'routing' && activeRouteOptions.length > 0) {
        const boundsPoints: [number, number][] = [];

        activeRouteOptions.forEach((ro) => {
          const isSelected = ro.id === selectedRouteId;
          
          let color = '#94a3b8'; // gray for unselected alternative
          let weight = 3;

          if (isSelected) {
            weight = 6;
            if (ro.name.includes('AI Recommended')) color = '#6366f1'; // indigo
            else if (ro.name.includes('Safest') || ro.name.includes('Accessible')) color = '#10b981'; // green
            else color = '#f59e0b'; // amber
          } else {
            if (ro.name.includes('AI Recommended')) color = '#a5b4fc';
            else if (ro.name.includes('Safest') || ro.name.includes('Accessible')) color = '#a7f3d0';
            else color = '#fde68a';
          }

          const points = ro.path.map(p => [p.lat, p.lng] as [number, number]);
          points.forEach(pt => boundsPoints.push(pt));

          // Draw main polyline
          const line = L.polyline(points, {
            color,
            weight,
            opacity: isSelected ? 0.95 : 0.5,
            lineJoin: 'round'
          })
            .bindPopup(`<b>${ro.name}</b>${isSelected ? ' (RECOMMENDED)' : ''}<br/>ETA: ${ro.eta} mins | Dist: ${ro.distance} km<br/>Score: ${ro.finalScore}/100<br/>Status: ${ro.status}`)
            .addTo(routesLayer.current!);

          // Add click listener on polyline to select route
          line.on('click', () => {
            useStore.setState({ selectedRouteId: ro.id });
          });

          // Add midpoint route label badge
          if (points.length > 2) {
            const midIndex = Math.floor(points.length / 2);
            const midPt = points[midIndex];

            const badgeIcon = L.divIcon({
              html: `
                <div class="px-2 py-0.5 rounded bg-white shadow-md border border-slate-300 text-[10px] font-bold text-slate-800 flex items-center gap-1 whitespace-nowrap">
                  <span>${ro.eta} min (${ro.distance} km)</span>
                  ${isSelected ? '<span class="text-indigo-600 font-extrabold">★ Recommended</span>' : ''}
                </div>
              `,
              className: 'custom-leaflet-route-badge',
              iconSize: [120, 20],
              iconAnchor: [60, 10]
            });

            L.marker(midPt, { icon: badgeIcon, interactive: true })
              .on('click', () => {
                useStore.setState({ selectedRouteId: ro.id });
              })
              .addTo(routesLayer.current!);
          }
        });

        // Fit map bounds to encompass all route options & markers
        if (selectedOrder) {
          boundsPoints.push([selectedOrder.pickupCoords.lat, selectedOrder.pickupCoords.lng]);
          boundsPoints.push([selectedOrder.destinationCoords.lat, selectedOrder.destinationCoords.lng]);
        }

        if (boundsPoints.length > 0) {
          const bounds = L.latLngBounds(boundsPoints);
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } else if ((activeTab === 'overview' || activeTab === 'liveOps') && selectedOrder) {
        // Draw route lines if there is an active order selected
        if (activeRouteOptions.length > 0) {
          const activeRoute = activeRouteOptions.find(r => r.id === selectedRouteId) || activeRouteOptions[0];
          const points = activeRoute.path.map(p => [p.lat, p.lng] as [number, number]);
          L.polyline(points, {
            color: '#6366f1',
            weight: 5,
            opacity: 0.8,
            lineJoin: 'round'
          }).addTo(routesLayer.current!);
        }
      }
    }
  }, [
    activeTab, vehicles, orders, incidents, accessibilityFeatures, 
    activeRouteOptions, selectedRouteId, selectedOrder, selectedVehicle, zones
  ]);

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full rounded-lg border border-slate-200/80 shadow-sm z-0" />
      
      {/* Small floating map controls / Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur px-3 py-2 rounded-lg shadow-md border border-slate-200 text-xs z-50 pointer-events-auto flex flex-col gap-1 w-44">
        <h4 className="font-bold text-slate-800 border-b pb-1 mb-1">Map Legend</h4>
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          <span>Pickup Location</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block"></span>
          <span>Destination</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
          <span>Vehicle (Available)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span>
          <span>Vehicle (Active)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <span className="w-3 h-3 rounded bg-red-500 inline-block flex items-center justify-center text-white text-[8px] font-bold">!</span>
          <span>Incident / Closure</span>
        </div>
        
        {activeTab === 'routing' && activeRouteOptions.length > 0 && (
          <div className="mt-1 pt-1 border-t flex flex-col gap-1">
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <span className="w-4 h-1 bg-indigo-600 inline-block"></span>
              <span>AI Recommended</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <span className="w-4 h-1 bg-emerald-500 inline-block"></span>
              <span>Safest / Accessible</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <span className="w-4 h-1 bg-amber-500 inline-block"></span>
              <span>Fastest Route</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
