# Ngangkari Clinic Dashboard

A clinic-facing web dashboard prototype for a small remote Australian community clinic. This interface is designed for staff use rather than emergency self-help, with a calm low-clutter layout, offline-aware workflow cues, and simple rules-based supply planning.

**Contribution:** Dashboard implementation by Alex within a team project.

## Implementation and limitations

- Sample resident and inventory data demonstrate the workflow; this is not a deployed clinical records system.
- Records, inventory and planning state persist in the browser's `localStorage` on the same browser and origin.
- Connectivity controls, queued-update counts and sync messages are simulated local state. A backend synchronisation service and multi-device conflict resolution are not implemented.
- Supply recommendations use explicit population and stock rules, not a trained AI model or clinically validated forecasting system.
- Delivery timing calculations use a fixed demonstration date in `src/utils/clinic.ts`.
- Local persistence does not establish that the application can be loaded from scratch without a network connection.
- Do not enter real patient information into the demonstration.

Live site: [https://ngangkari-clinic.vercel.app](https://ngangkari-clinic.vercel.app)

## What It Includes

- Community records for residents and households
- Searchable resident filtering with community-aware support tags
- Inventory tracking for clinical supplies and equipment
- Rules-based monthly order recommendations linked to population needs
- Simulated connectivity states for stable, patchy, and offline clinic conditions
- Responsive layout for mobile and desktop presentation

## Product Direction

This prototype is intentionally small in scope. It is not a hospital EHR and it does not make clinical decisions. The focus is practical clinic operations for:

- one clinic
- a small remote population
- limited equipment
- monthly deliveries
- low but not zero connectivity

## Technology

- React 19
- TypeScript
- Vite
- CSS with custom component styling
- Local mock data and `localStorage` for browser-local persistence

## Run Locally

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Build

```bash
npm run build
npm run lint
```

## Project Structure

```text
src/
  components/
    CommunityRecords.tsx
    Header.tsx
    InventoryPanel.tsx
    OrderRecommendations.tsx
  utils/
    clinic.ts
  assets/
    ngangkari-logo.svg
  App.tsx
  App.css
  data.ts
  index.css
  main.tsx
  types.ts
```

## Notes

- Sample data is included to demonstrate population-aware ordering logic.
- Offline-friendly behavior is modeled with cached local state and queued update messaging.
- Branding and visual tone were adapted to match the broader Ngangkari product family for presentation use.
