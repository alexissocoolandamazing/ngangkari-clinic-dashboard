import type {
  ConnectivityMode,
  InventoryCategory,
  InventoryItem,
  Resident,
  ResidentTag,
  TabId,
} from './types'

export const residentTagOptions: ResidentTag[] = [
  'elderly',
  'young family',
  'child',
  'Indigenous household',
  'chronic illness',
  'farm injury risk',
  'pregnancy/maternal support',
]

export const inventoryCategories: InventoryCategory[] = [
  'Medical equipment',
  'First-aid supplies',
  'Wound care items',
  'Maternal/child supplies',
  'Chronic disease supplies',
  'Sanitation/hygiene supplies',
]

export const dashboardTabs: Array<{
  id: TabId
  label: string
  helper: string
}> = [
  {
    id: 'records',
    label: 'Community Records',
    helper: 'Household-aware notes and follow-up history',
  },
  {
    id: 'inventory',
    label: 'Inventory',
    helper: 'Stock levels, monthly usage, and delivery cycle',
  },
  {
    id: 'orders',
    label: 'Order Recommendations',
    helper: 'Next month supply plan based on population needs',
  },
]

export const connectivityOptions: Array<{
  value: ConnectivityMode
  label: string
}> = [
  { value: 'connected', label: 'Stable' },
  { value: 'degraded', label: 'Patchy' },
  { value: 'offline', label: 'Offline' },
]

export const initialResidents: Resident[] = [
  {
    id: 'resident-elsie-thompson',
    fullName: 'Elsie Thompson',
    age: 74,
    gender: 'Woman',
    heightCm: 158,
    weightKg: 72,
    household: 'Red Creek Homestead',
    tags: ['elderly', 'chronic illness', 'Indigenous household'],
    conditions: ['Type 2 diabetes', 'Hypertension'],
    allergies: ['Penicillin'],
    medications: ['Metformin', 'Ramipril'],
    clinicNeeds: ['Glucose monitoring', 'Foot care review', 'Blood pressure checks'],
    riskNotes:
      'Lives with granddaughter. Needs clear medication reminders before station work trips.',
    lastContact: '2026-04-03',
    notes:
      'Responds well to practical care plans discussed with family present. Prefers short follow-up visits.',
    communicationSupport: 'Offer plain-language summaries and invite family support if she requests it.',
  },
  {
    id: 'resident-june-charlie',
    fullName: 'June Charlie',
    age: 68,
    gender: 'Woman',
    heightCm: 161,
    weightKg: 69,
    household: 'Riverbank Community Houses',
    tags: ['elderly', 'chronic illness', 'Indigenous household'],
    conditions: ['COPD', 'Osteoarthritis'],
    allergies: ['No known allergies'],
    medications: ['Salbutamol inhaler', 'Paracetamol'],
    clinicNeeds: ['Respiratory review', 'Mobility support', 'Transport check-ins'],
    riskNotes:
      'Cold snaps increase breathing difficulty. Avoid long waits outdoors before appointments.',
    lastContact: '2026-04-05',
    notes:
      'Often attends with a niece who helps track inhaler use. Keep spares on hand during busy stock periods.',
    communicationSupport: 'Provide a quiet consultation space and leave time for questions.',
  },
  {
    id: 'resident-jack-morton',
    fullName: 'Jack Morton',
    age: 58,
    gender: 'Man',
    heightCm: 182,
    weightKg: 94,
    household: 'East Paddock Camp',
    tags: ['chronic illness', 'farm injury risk'],
    conditions: ['Type 2 diabetes', 'Peripheral neuropathy'],
    allergies: ['Latex sensitivity'],
    medications: ['Metformin', 'Atorvastatin'],
    clinicNeeds: ['Wound checks', 'Glucose strips', 'Manual lifting advice'],
    riskNotes:
      'Still doing fencing work. Foot injuries may be under-reported unless specifically asked about.',
    lastContact: '2026-04-01',
    notes:
      'Monthly station runs mean he sometimes misses the usual delivery window for supplies.',
    communicationSupport: 'Best reached in the early morning before heading out to the property.',
  },
  {
    id: 'resident-kayla-wilson',
    fullName: 'Kayla Wilson',
    age: 29,
    gender: 'Woman',
    heightCm: 166,
    weightKg: 70,
    household: 'Clinic Road Housing',
    tags: ['young family', 'pregnancy/maternal support', 'Indigenous household'],
    conditions: ['28 weeks pregnant'],
    allergies: ['No known allergies'],
    medications: ['Prenatal vitamins'],
    clinicNeeds: ['Antenatal review', 'Iron supplementation', 'Family transport planning'],
    riskNotes:
      'Needs predictable appointment times because of child care and family transport coordination.',
    lastContact: '2026-04-07',
    notes:
      'Wants practical preparation advice for the next month and backup plans if roads flood.',
    communicationSupport: 'Use culturally safe, family-centred explanations and confirm transport options.',
  },
  {
    id: 'resident-noah-wilson',
    fullName: 'Noah Wilson',
    age: 3,
    gender: 'Boy',
    heightCm: 99,
    weightKg: 15,
    household: 'Clinic Road Housing',
    tags: ['child', 'young family', 'Indigenous household'],
    conditions: ['Asthma'],
    allergies: ['Dust mite sensitivity'],
    medications: ['Salbutamol inhaler'],
    clinicNeeds: ['Spacer checks', 'Hydration support', 'Respiratory follow-up'],
    riskNotes:
      'Symptoms worsen after dust storms. Keep family advice simple and repeat key triggers clearly.',
    lastContact: '2026-04-04',
    notes:
      'Family has a good routine when they have enough inhaler stock at home. Reassure and repeat action steps.',
    communicationSupport: 'Include parent or carer in demonstrations and use visual prompts where helpful.',
  },
  {
    id: 'resident-tara-singh',
    fullName: 'Tara Singh',
    age: 34,
    gender: 'Woman',
    heightCm: 168,
    weightKg: 62,
    household: 'Airstrip Cottage',
    tags: ['young family'],
    conditions: ['Iron deficiency'],
    allergies: ['Shellfish'],
    medications: ['Iron tablets'],
    clinicNeeds: ['Family vaccinations', 'Child hydration advice', 'Nutrition follow-up'],
    riskNotes:
      'Cares for two children and often collects supplies for neighbours in the same trip.',
    lastContact: '2026-03-31',
    notes:
      'Helpful contact for alerting nearby families when delivery dates shift.',
    communicationSupport: 'Prefers appointment reminders by text when the connection allows.',
  },
  {
    id: 'resident-mason-riley',
    fullName: 'Mason Riley',
    age: 36,
    gender: 'Man',
    heightCm: 186,
    weightKg: 88,
    household: 'South Bore Station',
    tags: ['farm injury risk'],
    conditions: ['Recurrent shoulder strain'],
    allergies: ['No known allergies'],
    medications: ['Ibuprofen as needed'],
    clinicNeeds: ['Wound care packs', 'Tetanus review', 'Splint availability'],
    riskNotes:
      'Frequently first on scene for machinery incidents. Clinic stock needs to cover serious lacerations.',
    lastContact: '2026-04-02',
    notes:
      'Travels long distances to the clinic, so he often requests extra bandages and dressing packs in one visit.',
    communicationSupport: 'Use quick, practical instructions that can be followed on station.',
  },
  {
    id: 'resident-levi-brooks',
    fullName: 'Levi Brooks',
    age: 12,
    gender: 'Boy',
    heightCm: 149,
    weightKg: 42,
    household: 'North Fence Cottage',
    tags: ['child', 'farm injury risk'],
    conditions: ['Seasonal eczema'],
    allergies: ['No known allergies'],
    medications: ['Topical emollient'],
    clinicNeeds: ['First-aid education', 'Wound cleaning supplies', 'Skin care follow-up'],
    riskNotes:
      'Often rides between properties after school. Keep dressing supplies available for small injuries.',
    lastContact: '2026-03-29',
    notes:
      'Grandfather prefers simple instructions written on one page and kept near the phone.',
    communicationSupport: 'Offer a short take-home care sheet for the household.',
  },
]

export const initialInventory: InventoryItem[] = [
  {
    id: 'glucose-strips',
    name: 'Glucose test strips',
    category: 'Chronic disease supplies',
    quantity: 140,
    unit: 'strips',
    monthlyUsage: 180,
    nextDelivery: '2026-04-29',
    reorderThreshold: 180,
    notes: 'Used across home monitoring loans and clinic reviews.',
  },
  {
    id: 'lancets',
    name: 'Lancets',
    category: 'Chronic disease supplies',
    quantity: 260,
    unit: 'units',
    monthlyUsage: 210,
    nextDelivery: '2026-04-29',
    reorderThreshold: 180,
    notes: 'Bundle with glucose strip orders where possible.',
  },
  {
    id: 'sterile-dressings',
    name: 'Sterile dressing packs',
    category: 'Wound care items',
    quantity: 22,
    unit: 'packs',
    monthlyUsage: 35,
    nextDelivery: '2026-04-29',
    reorderThreshold: 30,
    notes: 'High use after machinery incidents and wound reviews.',
  },
  {
    id: 'compression-bandages',
    name: 'Compression bandages',
    category: 'Wound care items',
    quantity: 18,
    unit: 'rolls',
    monthlyUsage: 20,
    nextDelivery: '2026-04-29',
    reorderThreshold: 16,
    notes: 'Keep spare rolls for splinting and sprain support.',
  },
  {
    id: 'sam-splints',
    name: 'SAM splints',
    category: 'Medical equipment',
    quantity: 4,
    unit: 'splints',
    monthlyUsage: 3,
    nextDelivery: '2026-04-29',
    reorderThreshold: 4,
    notes: 'Reusable but often lent out during station call-outs.',
  },
  {
    id: 'antenatal-packs',
    name: 'Antenatal nutrition packs',
    category: 'Maternal/child supplies',
    quantity: 10,
    unit: 'packs',
    monthlyUsage: 8,
    nextDelivery: '2026-04-29',
    reorderThreshold: 10,
    notes: 'Includes supplements, hydration notes, and maternity consumables.',
  },
  {
    id: 'oral-rehydration',
    name: 'Infant oral rehydration sachets',
    category: 'Maternal/child supplies',
    quantity: 12,
    unit: 'sachets',
    monthlyUsage: 18,
    nextDelivery: '2026-04-29',
    reorderThreshold: 15,
    notes: 'High-value during summer heat and gastro outbreaks.',
  },
  {
    id: 'salbutamol',
    name: 'Salbutamol inhalers',
    category: 'Chronic disease supplies',
    quantity: 11,
    unit: 'inhalers',
    monthlyUsage: 9,
    nextDelivery: '2026-04-29',
    reorderThreshold: 8,
    notes: 'Keep a buffer for children and elderly respiratory support.',
  },
  {
    id: 'hygiene-packs',
    name: 'Hygiene support packs',
    category: 'Sanitation/hygiene supplies',
    quantity: 16,
    unit: 'packs',
    monthlyUsage: 14,
    nextDelivery: '2026-04-29',
    reorderThreshold: 10,
    notes: 'Used for household support visits and discharge planning.',
  },
  {
    id: 'trauma-kits',
    name: 'First-response trauma kits',
    category: 'First-aid supplies',
    quantity: 6,
    unit: 'kits',
    monthlyUsage: 5,
    nextDelivery: '2026-04-29',
    reorderThreshold: 6,
    notes: 'Small reserve for remote property incidents before retrieval.',
  },
]

export const initialSyncState = {
  mode: 'degraded',
  queuedChanges: 2,
  lastSync: '2026-04-09T08:42:00+10:00',
  cacheStatus: 'ready',
} satisfies {
  mode: ConnectivityMode
  queuedChanges: number
  lastSync: string
  cacheStatus: 'ready'
}
