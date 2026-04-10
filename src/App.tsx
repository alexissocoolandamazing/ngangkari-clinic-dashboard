import { startTransition, useEffect, useState } from 'react'
import './App.css'
import { CommunityRecords } from './components/CommunityRecords'
import { Header } from './components/Header'
import { InventoryPanel } from './components/InventoryPanel'
import { OrderRecommendations } from './components/OrderRecommendations'
import { initialInventory, initialResidents, initialSyncState } from './data'
import type {
  ConnectivityMode,
  InventoryItem,
  Resident,
  SyncState,
  TabId,
} from './types'
import {
  buildOrderRecommendations,
  buildPopulationDrivers,
  formatDateTime,
} from './utils/clinic'

const RESIDENTS_STORAGE_KEY = 'ngangkari-clinic-residents'
const INVENTORY_STORAGE_KEY = 'ngangkari-clinic-inventory'
const SYNC_STORAGE_KEY = 'ngangkari-clinic-sync'
const ORDER_PLAN_STORAGE_KEY = 'ngangkari-clinic-order-plan'

const legacyStorageKeys: Record<string, string[]> = {
  [RESIDENTS_STORAGE_KEY]: ['nangkari-clinic-residents'],
  [INVENTORY_STORAGE_KEY]: ['nangkari-clinic-inventory'],
  [SYNC_STORAGE_KEY]: ['nangkari-clinic-sync'],
  [ORDER_PLAN_STORAGE_KEY]: ['nangkari-clinic-order-plan'],
}

function loadLocalState<T>(storageKey: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback
  }

  try {
    const candidateKeys = [storageKey, ...(legacyStorageKeys[storageKey] ?? [])]

    for (const candidateKey of candidateKeys) {
      const savedValue = window.localStorage.getItem(candidateKey)
      if (!savedValue) {
        continue
      }

      const parsedValue = JSON.parse(savedValue) as T
      if (candidateKey !== storageKey) {
        window.localStorage.setItem(storageKey, JSON.stringify(parsedValue))
      }
      return parsedValue
    }

    return fallback
  } catch {
    return fallback
  }
}

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('records')
  const [residents, setResidents] = useState<Resident[]>(() =>
    loadLocalState(RESIDENTS_STORAGE_KEY, initialResidents),
  )
  const [inventory, setInventory] = useState<InventoryItem[]>(() =>
    loadLocalState(INVENTORY_STORAGE_KEY, initialInventory),
  )
  const [syncState, setSyncState] = useState<SyncState>(() =>
    loadLocalState(SYNC_STORAGE_KEY, initialSyncState),
  )
  const [orderPlanUpdatedAt, setOrderPlanUpdatedAt] = useState<string>(() =>
    loadLocalState(ORDER_PLAN_STORAGE_KEY, initialSyncState.lastSync),
  )
  const [activityMessage, setActivityMessage] = useState(
    'Clinic data is cached on this device for low-connectivity use.',
  )

  useEffect(() => {
    window.localStorage.setItem(RESIDENTS_STORAGE_KEY, JSON.stringify(residents))
  }, [residents])

  useEffect(() => {
    window.localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory))
  }, [inventory])

  useEffect(() => {
    window.localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(syncState))
  }, [syncState])

  useEffect(() => {
    window.localStorage.setItem(
      ORDER_PLAN_STORAGE_KEY,
      JSON.stringify(orderPlanUpdatedAt),
    )
  }, [orderPlanUpdatedAt])

  const recommendations = buildOrderRecommendations(residents, inventory)
  const populationDrivers = buildPopulationDrivers(residents)

  function noteSync(actionLabel: string) {
    const now = new Date().toISOString()
    setActivityMessage(actionLabel)
    setSyncState((previous) => {
      if (previous.mode === 'connected') {
        return {
          ...previous,
          lastSync: now,
          queuedChanges: 0,
          cacheStatus: 'ready',
        }
      }

      return {
        ...previous,
        queuedChanges: previous.queuedChanges + 1,
        cacheStatus: 'ready',
      }
    })
  }

  function handleTabChange(nextTab: TabId) {
    startTransition(() => {
      setActiveTab(nextTab)
    })
  }

  function handleConnectivityChange(nextMode: ConnectivityMode) {
    setSyncState((previous) => {
      const now = new Date().toISOString()
      if (nextMode === 'connected') {
        setActivityMessage(
          previous.queuedChanges > 0
            ? `Connection restored. ${previous.queuedChanges} queued updates are ready to sync.`
            : 'Clinic network stable. Live sync is available.',
        )
        return {
          ...previous,
          mode: nextMode,
          queuedChanges: 0,
          lastSync: now,
          cacheStatus: 'ready',
        }
      }

      setActivityMessage(
        nextMode === 'degraded'
          ? 'Clinic sync is patchy. New changes will stay cached until the link settles.'
          : 'Clinic is offline. Staff can still work locally and queue updates safely.',
      )
      return {
        ...previous,
        mode: nextMode,
        cacheStatus: 'ready',
      }
    })
  }

  function handleResidentSave(resident: Resident) {
    setResidents((previous) => {
      const exists = previous.some((entry) => entry.id === resident.id)
      if (exists) {
        return previous.map((entry) => (entry.id === resident.id ? resident : entry))
      }

      return [resident, ...previous]
    })

    noteSync(
      syncState.mode === 'connected'
        ? `Resident record saved. Last sync ${formatDateTime(new Date().toISOString())}.`
        : 'Resident update saved locally and queued for clinic sync.',
    )
  }

  function handleInventorySave(item: InventoryItem) {
    setInventory((previous) => {
      const exists = previous.some((entry) => entry.id === item.id)
      if (exists) {
        return previous.map((entry) => (entry.id === item.id ? item : entry))
      }

      return [item, ...previous]
    })

    noteSync(
      syncState.mode === 'connected'
        ? `Inventory updated. Stock snapshot refreshed ${formatDateTime(new Date().toISOString())}.`
        : 'Inventory update saved locally and added to the sync queue.',
    )
  }

  function handleGeneratePlan() {
    startTransition(() => {
      const now = new Date().toISOString()
      setOrderPlanUpdatedAt(now)
      setActivityMessage(
        syncState.mode === 'connected'
          ? 'Next month order plan refreshed from current residents and stock levels.'
          : 'Next month order plan generated locally and kept ready for sync.',
      )
    })

    noteSync('Order planning snapshot updated from cached clinic data.')
  }

  return (
    <div className="app-shell">
      <Header
        activeTab={activeTab}
        activityMessage={activityMessage}
        onConnectivityChange={handleConnectivityChange}
        onTabChange={handleTabChange}
        syncState={syncState}
      />

      <main className="dashboard-shell">
        <section className="sync-banner surface-card">
          <div>
            <p className="eyebrow">Offline-ready clinic workflow</p>
            <h2>Staff can keep working even when the link drops out</h2>
            <p className="muted-copy">
              Local records, stock edits, and monthly order planning stay cached on
              this device. Queued changes sync safely once the clinic connection
              improves.
            </p>
          </div>
          <div className="sync-banner__meta">
            <span className="pill pill--muted">
              {syncState.queuedChanges} queued update
              {syncState.queuedChanges === 1 ? '' : 's'}
            </span>
            <span className="pill pill--outline">
              Last sync {formatDateTime(syncState.lastSync)}
            </span>
          </div>
        </section>

        {activeTab === 'records' ? (
          <CommunityRecords residents={residents} onSaveResident={handleResidentSave} />
        ) : null}

        {activeTab === 'inventory' ? (
          <InventoryPanel inventory={inventory} onSaveItem={handleInventorySave} />
        ) : null}

        {activeTab === 'orders' ? (
          <OrderRecommendations
            inventory={inventory}
            lastGeneratedAt={orderPlanUpdatedAt}
            onGeneratePlan={handleGeneratePlan}
            populationDrivers={populationDrivers}
            recommendations={recommendations}
            syncState={syncState}
          />
        ) : null}
      </main>
    </div>
  )
}

export default App
