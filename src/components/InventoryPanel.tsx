import { useDeferredValue, useState, type FormEvent } from 'react'
import { inventoryCategories } from '../data'
import type { InventoryCategory, InventoryItem } from '../types'
import {
  formatDate,
  getCoverageMonths,
  getInventoryStatus,
} from '../utils/clinic'

interface InventoryPanelProps {
  inventory: InventoryItem[]
  onSaveItem: (item: InventoryItem) => void
}

interface InventoryFormState {
  id?: string
  name: string
  category: InventoryCategory
  quantity: string
  unit: string
  monthlyUsage: string
  nextDelivery: string
  reorderThreshold: string
  notes: string
}

function createInventoryForm(item?: InventoryItem): InventoryFormState {
  if (!item) {
    return {
      name: '',
      category: 'Chronic disease supplies',
      quantity: '',
      unit: 'units',
      monthlyUsage: '',
      nextDelivery: '2026-04-29',
      reorderThreshold: '',
      notes: '',
    }
  }

  return {
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: String(item.quantity),
    unit: item.unit,
    monthlyUsage: String(item.monthlyUsage),
    nextDelivery: item.nextDelivery,
    reorderThreshold: String(item.reorderThreshold),
    notes: item.notes,
  }
}

export function InventoryPanel({ inventory, onSaveItem }: InventoryPanelProps) {
  const [searchValue, setSearchValue] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | 'all'>('all')
  const [selectedItemId, setSelectedItemId] = useState(inventory[0]?.id ?? '')
  const [formState, setFormState] = useState<InventoryFormState>(() => createInventoryForm())
  const deferredSearchValue = useDeferredValue(searchValue)

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      deferredSearchValue.trim().length === 0 ||
      `${item.name} ${item.category} ${item.notes}`
        .toLowerCase()
        .includes(deferredSearchValue.toLowerCase())
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const activeSelectedItemId =
    filteredInventory.find((item) => item.id === selectedItemId)?.id ??
    filteredInventory[0]?.id ??
    inventory[0]?.id ??
    ''

  const lowStockCount = inventory.filter(
    (item) => getInventoryStatus(item) === 'Low',
  ).length
  const criticalStockCount = inventory.filter(
    (item) => getInventoryStatus(item) === 'Critical',
  ).length
  const nextDelivery = inventory.reduce(
    (soonest, item) => (item.nextDelivery < soonest ? item.nextDelivery : soonest),
    inventory[0]?.nextDelivery ?? '2026-04-29',
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const item: InventoryItem = {
      id: formState.id ?? `inventory-${crypto.randomUUID()}`,
      name: formState.name.trim(),
      category: formState.category,
      quantity: Number(formState.quantity),
      unit: formState.unit.trim(),
      monthlyUsage: Number(formState.monthlyUsage),
      nextDelivery: formState.nextDelivery,
      reorderThreshold: Number(formState.reorderThreshold),
      notes: formState.notes.trim(),
    }

    onSaveItem(item)
    setSelectedItemId(item.id)
    setFormState(createInventoryForm())
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Clinic stock control</p>
          <h1>Simple inventory scanning for a monthly delivery cycle</h1>
        </div>
        <p className="muted-copy">
          Track what matters most to a small clinic: what is on hand, how quickly it is
          being used, and whether the next delivery window leaves enough buffer.
        </p>
      </div>

      <div className="overview-grid">
        <article className="surface-card overview-card">
          <p className="eyebrow">Tracked items</p>
          <h2>{inventory.length}</h2>
          <p className="muted-copy">Across wound care, chronic care, maternal, and hygiene lines</p>
        </article>
        <article className="surface-card overview-card">
          <p className="eyebrow">Low stock</p>
          <h2>{lowStockCount}</h2>
          <p className="muted-copy">Needs attention before the next order closes</p>
        </article>
        <article className="surface-card overview-card">
          <p className="eyebrow">Critical stock</p>
          <h2>{criticalStockCount}</h2>
          <p className="muted-copy">Closest to falling below safe buffer levels</p>
        </article>
        <article className="surface-card overview-card">
          <p className="eyebrow">Next delivery</p>
          <h2>{formatDate(nextDelivery)}</h2>
          <p className="muted-copy">Monthly freight cycle currently scheduled</p>
        </article>
      </div>

      <div className="surface-card control-card">
        <label className="search-field">
          <span className="search-label">Search inventory</span>
          <input
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search by stock item, category, or notes"
            type="search"
            value={searchValue}
          />
        </label>

        <div className="chip-row" aria-label="Inventory categories">
          <button
            aria-pressed={selectedCategory === 'all'}
            className={selectedCategory === 'all' ? 'chip is-active' : 'chip'}
            onClick={() => setSelectedCategory('all')}
            type="button"
          >
            All categories
          </button>
          {inventoryCategories.map((category) => (
            <button
              key={category}
              aria-pressed={selectedCategory === category}
              className={selectedCategory === category ? 'chip is-active' : 'chip'}
              onClick={() => setSelectedCategory(category)}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="inventory-layout">
        <div className="surface-card">
          <div className="panel-header">
            <div>
              <h2>Stock list</h2>
              <p className="muted-copy">
                Easy scanning with quantity, monthly usage, and next delivery in one place
              </p>
            </div>
            <button
              className="button button--primary"
              onClick={() => setFormState(createInventoryForm())}
              type="button"
            >
              Add stock item
            </button>
          </div>

          <div className="list-stack">
            {filteredInventory.map((item) => {
              const status = getInventoryStatus(item)
              const coverageMonths = getCoverageMonths(item)
              return (
                <button
                  key={item.id}
                  className={
                    item.id === activeSelectedItemId
                      ? 'inventory-card is-selected'
                      : 'inventory-card'
                  }
                  onClick={() => {
                    setSelectedItemId(item.id)
                    setFormState(createInventoryForm(item))
                  }}
                  type="button"
                >
                  <div className="inventory-card__row">
                    <div>
                      <h3>{item.name}</h3>
                      <p>{item.category}</p>
                    </div>
                    <span className={`status-badge status-badge--${status.toLowerCase()}`}>
                      {status}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span>
                      <strong>{item.quantity}</strong> {item.unit} on hand
                    </span>
                    <span>{item.monthlyUsage} / month</span>
                    <span>{coverageMonths.toFixed(1)} months cover</span>
                    <span>Delivery {formatDate(item.nextDelivery)}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <article className="surface-card">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Add or edit</p>
              <h2>{formState.id ? 'Update stock item' : 'New stock item'}</h2>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="form-grid__full">
              Item name
              <input
                onChange={(event) =>
                  setFormState((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                required
                type="text"
                value={formState.name}
              />
            </label>
            <label>
              Category
              <select
                onChange={(event) =>
                  setFormState((previous) => ({
                    ...previous,
                    category: event.target.value as InventoryCategory,
                  }))
                }
                value={formState.category}
              >
                {inventoryCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Unit
              <input
                onChange={(event) =>
                  setFormState((previous) => ({
                    ...previous,
                    unit: event.target.value,
                  }))
                }
                required
                type="text"
                value={formState.unit}
              />
            </label>
            <label>
              Quantity on hand
              <input
                min="0"
                onChange={(event) =>
                  setFormState((previous) => ({
                    ...previous,
                    quantity: event.target.value,
                  }))
                }
                required
                type="number"
                value={formState.quantity}
              />
            </label>
            <label>
              Monthly usage
              <input
                min="0"
                onChange={(event) =>
                  setFormState((previous) => ({
                    ...previous,
                    monthlyUsage: event.target.value,
                  }))
                }
                required
                type="number"
                value={formState.monthlyUsage}
              />
            </label>
            <label>
              Reorder threshold
              <input
                min="0"
                onChange={(event) =>
                  setFormState((previous) => ({
                    ...previous,
                    reorderThreshold: event.target.value,
                  }))
                }
                required
                type="number"
                value={formState.reorderThreshold}
              />
            </label>
            <label>
              Next delivery cycle
              <input
                onChange={(event) =>
                  setFormState((previous) => ({
                    ...previous,
                    nextDelivery: event.target.value,
                  }))
                }
                required
                type="date"
                value={formState.nextDelivery}
              />
            </label>
            <label className="form-grid__full">
              Notes
              <textarea
                onChange={(event) =>
                  setFormState((previous) => ({
                    ...previous,
                    notes: event.target.value,
                  }))
                }
                rows={4}
                value={formState.notes}
              />
            </label>

            <div className="form-actions form-grid__full">
              <button className="button button--primary" type="submit">
                {formState.id ? 'Save stock item' : 'Create stock item'}
              </button>
              <button
                className="button button--ghost"
                onClick={() => setFormState(createInventoryForm())}
                type="button"
              >
                Clear form
              </button>
            </div>
          </form>
        </article>
      </div>
    </section>
  )
}
