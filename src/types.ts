export type TabId = 'records' | 'inventory' | 'orders'

export type ConnectivityMode = 'connected' | 'degraded' | 'offline'

export type ResidentTag =
  | 'elderly'
  | 'young family'
  | 'child'
  | 'Indigenous household'
  | 'chronic illness'
  | 'farm injury risk'
  | 'pregnancy/maternal support'

export type InventoryCategory =
  | 'Medical equipment'
  | 'First-aid supplies'
  | 'Wound care items'
  | 'Maternal/child supplies'
  | 'Chronic disease supplies'
  | 'Sanitation/hygiene supplies'

export type InventoryStatus = 'Healthy' | 'Low' | 'Critical'

export type RecommendationUrgency = 'Routine' | 'Watch' | 'Urgent'

export interface Resident {
  id: string
  fullName: string
  age: number
  gender: string
  heightCm?: number
  weightKg?: number
  household: string
  tags: ResidentTag[]
  conditions: string[]
  allergies: string[]
  medications: string[]
  clinicNeeds: string[]
  riskNotes: string
  lastContact: string
  notes: string
  communicationSupport: string
}

export interface InventoryItem {
  id: string
  name: string
  category: InventoryCategory
  quantity: number
  unit: string
  monthlyUsage: number
  nextDelivery: string
  reorderThreshold: number
  notes: string
}

export interface OrderRecommendation {
  id: string
  itemId: string
  itemName: string
  category: InventoryCategory
  urgency: RecommendationUrgency
  suggestedQuantity: number
  unit: string
  shortage: number
  reason: string
  drivers: string[]
  currentStock: number
  nextDelivery: string
  stockStatus: InventoryStatus
}

export interface PopulationDriver {
  id: string
  label: string
  count: number
  description: string
  relatedItems: string[]
  tone: 'support' | 'watch' | 'urgent'
}

export interface SyncState {
  mode: ConnectivityMode
  queuedChanges: number
  lastSync: string
  cacheStatus: 'ready' | 'refreshing'
}
