# Neural Nexus: North East Smart Logistics & Accessibility Intelligence Platform

Neural Nexus is a logistics control center and dual-objective route optimization dashboard built for the **Smart India Hackathon 2026**. 
It is designed to solve logistics routing in the challenging, high-slope mountainous terrain of Northeast India—specifically centered around **Shillong, Meghalaya**.

---

## 1. The Regional Problem
Traditional routing algorithms optimize primarily for ETA, fuel cost, and mileage. In the hill states of India's Northeast:
- **Mountainous Topography**: Narrow streets and steep inclines (often exceeding 12-15% slope grade) make standard low-floor vehicles risk slipping or getting stuck.
- **Extreme Weather**: Torrential rains trigger flash floods and landslides, rendering routes unusable within minutes.
- **Bridge Dependencies**: Remote settlements often rely on single-lane bridge corridors.
- **Sparse Accessibility Data**: Physical accessibility features (ramps, stairs, pedestrian walkways) are rarely mapped in public datasets. Assuming unmapped zones are accessible is a dangerous assumption.

---

## 2. The Neural Nexus Solution
Neural Nexus implements a **dual-objective vehicle routing solver** that balances traditional operational efficiency with real-world accessibility metrics and terrain risk variables.

### Key Innovations:
1. **Dual-Objective Optimization**: Optimization weight sliders balance delivery speed against terrain safety and wheelchair accessibility.
2. **Terrain & Slope Risk Scorer**: Calculates incline gradient percentages, bridge risks, and landslide history to flag routes.
3. **Data Confidence Layer**: Sparse accessibility regions remain visibly marked as "Unknown Confidence" rather than assuming they are accessible.
4. **Human Feedback Loop**: Drivers and citizens submit ground hazard reports that dynamically adjust map layers, confidence percentages, and route scoring instantly.
5. **Vehicle-aware constraints**: Solves routes depending on vehicle capability (e.g., matching 4x4 vehicles for high slopes, or restricting trucks from narrow alleys).

---

## 3. Technology Stack
- **Frontend Core**: Next.js (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **GIS Mapping**: Leaflet + OpenStreetMap (loaded client-side dynamically with SSR disabled)
- **Charts**: Recharts (fully mounted client-side to prevent hydration mismatches)
- **Icons**: Lucide React

---

## 4. System Architecture
```
[DATA INGESTION] -> GPS, Orders, OSM Grid, Citizen Reports, Landslide Alerts
       |
[FEATURE ENGINEERING] -> Slope Gradient, Road Widths, Data Sparsity
       |
[AI SCORING ENGINE] -> ETA Predictor, Terrain Risk Scorer, Accessibility Scorer
       |
[VRP OPTIMIZER] -> Dijkstra Pathfinder snapped to Shillong Node Graph
       |
[PRESENTATION] -> Dynamic Leaflet Map overlays, Route Comparison Cards
       |
[FEEDBACK LOOP] -> Operator Verification Portal -> Adjusts data confidence
```

---

## 5. How to Install and Run
Ensure Node.js (version 20 or higher) is installed on your system.

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Launch Developer Server**:
   ```bash
   npm run dev
   ```

3. **Open Browser**:
   Navigate to `http://localhost:3000` to interact with the command dashboard.

---

## 6. SIH Live Judges Demonstration Walkthrough
Neural Nexus has a built-in **SIH Judges Demo Mode** to guide presenters through a live scenario:

1. **Launch the Demo**: On the opening landing page, click **Run Guided Demo Mode** (or click **Start SIH Demo** in the top navbar).
2. **Step 1 — Incoming Delivery**: System registers a priority cargo delivery from `Bara Bazar` bound for `NEHU`. The assigned vehicle is the `Electric Van` and the customer requested a `Wheelchair Accessible` route.
3. **Step 2 — Optimize Route**: Click **Analyze & Optimize Route**. The system performs a VRP run and returns 3 route calculations:
   - *Route A — Fastest*: Direct, but runs through a steep, unverified slope segment with low data confidence.
   - *Route B — Safest*: Low slope, fully accessible, but adds substantial transit time.
   - *Route C — AI Recommended*: Indigo highlight. Bypasses the high-slope risks, utilizes verified lanes, and explains the trade-off.
4. **Step 3 — Inspect Explainability**: Read the **Why Neural Nexus Recommends This Route** card. It details the exact benefits (avoided hazards) and trade-offs (+4 mins, +1.1 km).
5. **Step 4 — Simulate Landslide Blockage**: In the floating demo assistant, click **Simulate Landslide** (or trigger it via Live Operations). A critical landslide is marked on the active route.
6. **Step 5 — Observe Rerouting**: The console sounds alarms, flags the route as blocked, and automatically recalculates. A new route bypassing the landslide segment is selected and displayed on the map, updating the ETA.
7. **Step 6 — Citizen Feedback Loop**: Navigate to **Feedback & Reports**. Submit a report describing road debris near *Police Bazar*.
8. **Step 7 — Observe GIS Map Update**: The report displays as a warning on the map and lists as "Pending Verification" in the feedback queue. Once the operator clicks **Verify**, data confidence registers, and future routing requests avoid the local segment.
