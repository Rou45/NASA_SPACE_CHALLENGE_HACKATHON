# 🚀 **HACKATHON API INTEGRATION GUIDE**
## Transform Static Data to Live APIs

This guide shows **exactly** which APIs you need and how to integrate them into your Space Habitat Layout Creator for hackathon real-time data.

---

## 🎯 **APIs Required for Your Hackathon**

### **1. NASA Standards API** 
**Purpose:** Real-time NASA habitat requirements and standards
```javascript
// Base URL: https://api.nasa.gov/
// OR create your own endpoint
GET /nasa-standards/volume-requirements
GET /nasa-standards/life-support-specs
GET /nasa-standards/safety-requirements
```

**Data Structure:**
```json
{
  "volumeRequirements": {
    "nhvPerCrewMinimum": 25.0,
    "nhvPerCrewOptimal": 75.0,
    "sleepVolumePerCrew": 2.5,
    "workVolumePerCrew": 8.0
  },
  "lifeSupportStandards": {
    "oxygenPartialPressure": {"min": 16.0, "max": 23.0},
    "co2MaxLevel": 0.7,
    "temperatureRange": {"min": 18.3, "max": 26.7}
  }
}
```

### **2. Launch Vehicle Database API**
**Purpose:** Real-time rocket specifications and availability
```javascript
GET /launch-vehicles
GET /launch-vehicles/falcon_heavy/specifications
```

**Data Structure:**
```json
{
  "vehicles": [
    {
      "id": "falcon_heavy",
      "name": "SpaceX Falcon Heavy",
      "specifications": {
        "diameter": 5.2,
        "height": 13.1,
        "massLimit": 26700,
        "costPerKg": 1400
      },
      "availability": {
        "nextLaunch": "2025-12-01",
        "status": "available"
      }
    }
  ]
}
```

### **3. Space Materials API**
**Purpose:** Real material properties and costs
```javascript
GET /materials
GET /materials/aluminum_6061/properties
```

### **4. Orbital Environment API**
**Purpose:** Real-time space environment data
```javascript
GET /environment/lunar_surface/current
GET /environment/mars_surface/forecast
```

### **5. Community Designs API**
**Purpose:** User-submitted habitat designs
```javascript
GET /community-designs
POST /community-designs
```

---

## 📂 **File Modifications Required**

### **STEP 1: Replace Static Constants**

**File:** `src/constants/nasa-standards.ts`
**Action:** Replace with API calls

```typescript
// BEFORE (Static)
export const NASA_VOLUME_STANDARDS = {
  NHV_PER_CREW_MINIMUM: 25,
  NHV_PER_CREW_OPTIMAL: 75,
  // ... static values
};

// AFTER (API-driven)
import APIService from '../services/apiService';

let nasaStandards: any = null;

export const getNASAStandards = async () => {
  if (!nasaStandards) {
    nasaStandards = await APIService.getNASAStandards();
  }
  return nasaStandards;
};
```

### **STEP 2: Update Validation Engine**

**File:** `src/utils/validation.ts`
**Action:** Accept live data as parameters

```typescript
// BEFORE
static validateDesign(design: HabitatDesign): ValidationResult[] {
  // Uses static NASA_VOLUME_STANDARDS
}

// AFTER  
static validateDesignWithLiveData(
  design: HabitatDesign, 
  nasaStandards: NASAStandardsResponse
): ValidationResult[] {
  // Uses live nasaStandards parameter
  const volumePerCrew = design.netHabitableVolume / design.missionParameters.crewSize;
  
  if (volumePerCrew < nasaStandards.volumeRequirements.nhvPerCrewMinimum) {
    // Validation logic with live data
  }
}
```

### **STEP 3: Update Zustand Store**

**File:** `src/stores/habitatStore.ts`
**Action:** Add API state and actions

```typescript
interface HabitatStore {
  // Existing state...
  currentDesign: HabitatDesign | null;
  
  // NEW: API data
  nasaStandards: NASAStandardsResponse | null;
  launchVehicles: LaunchVehicleResponse[];
  apiLoading: boolean;
  
  // NEW: API actions
  initializeAPIData: () => Promise<void>;
  refreshData: () => Promise<void>;
}
```

### **STEP 4: Update Components**

**File:** `src/components/layout/Sidebar.tsx`
**Action:** Use live launch vehicle data

```typescript
// BEFORE (Static dropdown)
<select>
  <option value="falcon_heavy">Falcon Heavy</option>
  <option value="sls_block_1">SLS Block 1</option>
</select>

// AFTER (API-driven dropdown)
const { launchVehicles } = useHabitatStore();

<select>
  {launchVehicles.map(vehicle => (
    <option key={vehicle.id} value={vehicle.id}>
      {vehicle.name} - ${vehicle.availability.costPerKg}/kg
    </option>
  ))}
</select>
```

### **STEP 5: Replace Sample Designs**

**File:** `src/constants/sample-designs.ts`
**Action:** Load from community API

```typescript
// BEFORE (Static designs)
export const SAMPLE_DESIGNS = [
  LUNA_BASE_ALPHA,
  MARS_TRANSIT_HABITAT,
  ISS_GATEWAY,
];

// AFTER (API-driven)
import APIService from '../services/apiService';

export const loadSampleDesigns = async () => {
  const communityDesigns = await APIService.getCommunityDesigns();
  return communityDesigns.map(d => d.design_data);
};
```

---

## 🔧 **Implementation Steps**

### **1. Set Up Environment Variables**
Create `.env` file:
```bash
VITE_API_BASE_URL=https://your-hackathon-api.com/api
VITE_NASA_API_KEY=your_nasa_api_key
```

### **2. Initialize API Data on App Start**
**File:** `src/App.tsx`
```typescript
export function App() {
  const initializeAPIData = useHabitatStore(state => state.initializeAPIData);
  
  useEffect(() => {
    // Load live data when app starts
    initializeAPIData();
  }, []);
  
  // Rest of your app...
}
```

### **3. Add Loading States**
**File:** `src/components/layout/Header.tsx`
```typescript
const { apiLoading, apiError } = useHabitatStore();

return (
  <header>
    {apiLoading && <div>Loading live data...</div>}
    {apiError && <div>⚠️ Using offline mode: {apiError}</div>}
    {/* Rest of header */}
  </header>
);
```

### **4. Update Validation Panel**
**File:** `src/components/panels/ValidationPanel.tsx`
```typescript
const { nasaStandards, validateDesign } = useHabitatStore();

// Show live standards info
{nasaStandards && (
  <div>
    <h3>Live NASA Standards</h3>
    <p>Min Volume/Crew: {nasaStandards.volumeRequirements.nhvPerCrewMinimum}m³</p>
    <p>Temp Range: {nasaStandards.lifeSupportStandards.temperatureRange.min}°C - 
       {nasaStandards.lifeSupportStandards.temperatureRange.max}°C</p>
  </div>
)}
```

---

## 🌐 **API Endpoints You Need to Provide**

For your hackathon, you'll need to create these endpoints:

### **Backend Requirements:**
```javascript
// Express.js example
app.get('/api/nasa-standards', (req, res) => {
  res.json({
    volumeRequirements: { /* live data */ },
    lifeSupportStandards: { /* live data */ },
    safetyFactors: { /* live data */ }
  });
});

app.get('/api/launch-vehicles', (req, res) => {
  res.json([/* array of launch vehicles with live pricing */]);
});

app.get('/api/community-designs', (req, res) => {
  res.json([/* user-submitted designs */]);
});

app.post('/api/community-designs', (req, res) => {
  // Save new design to database
  res.json({ id: 'new-design-id', status: 'saved' });
});
```

### **Real APIs You Can Use:**
1. **NASA Open Data API:** `https://api.nasa.gov/`
2. **ISS Position API:** `http://api.open-notify.org/iss-now.json`
3. **SpaceX API:** `https://api.spacexdata.com/v4/launches`
4. **Create your own:** Materials, standards, community features

---

## 🏆 **Hackathon Impact**

With live APIs, your app becomes:
- ✅ **Real-time**: Always current data
- ✅ **Community-driven**: User submissions
- ✅ **Cost-aware**: Live pricing data  
- ✅ **Standards-compliant**: Latest NASA requirements
- ✅ **Interactive**: Share and collaborate

**Result:** Transform from static demo to **production-ready space design platform**!

---

## 🚀 **Quick Start Commands**

```bash
# 1. Install the API service
# (Already created: src/services/apiService.ts)

# 2. Update your .env file
echo "VITE_API_BASE_URL=https://your-api.com/api" >> .env
echo "VITE_NASA_API_KEY=your_key" >> .env

# 3. Replace your store import
# In App.tsx: import { useHabitatStore } from './stores/habitatStoreWithAPI';

# 4. Test with live data
npm run dev
```

**Your app will now pull live data instead of static constants!** 🎉