import type {
  InventoryItem,
  OrderRecommendation,
  PopulationDriver,
  SyncState,
} from '../types'
import { formatDate, formatDateTime, getInventoryStatus } from '../utils/clinic'

interface OrderRecommendationsProps {
  inventory: InventoryItem[]
  lastGeneratedAt: string
  onGeneratePlan: () => void
  populationDrivers: PopulationDriver[]
  recommendations: OrderRecommendation[]
  syncState: SyncState
}

export function OrderRecommendations({
  inventory,
  lastGeneratedAt,
  onGeneratePlan,
  populationDrivers,
  recommendations,
  syncState,
}: OrderRecommendationsProps) {
  const urgentCount = recommendations.filter(
    (recommendation) => recommendation.urgency === 'Urgent',
  ).length
  const suggestedUnits = recommendations.reduce(
    (sum, recommendation) => sum + recommendation.suggestedQuantity,
    0,
  )
  const lowOrCriticalCount = inventory.filter((item) =>
    ['Low', 'Critical'].includes(getInventoryStatus(item)),
  ).length

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Population-aware ordering</p>
          <h1>Order planning that explains what the clinic should top up next</h1>
        </div>
        <p className="muted-copy">
          This MVP uses transparent rules instead of black-box AI. Recommendations are
          driven by the current resident mix, stock pressure, and how far away the next
          monthly delivery sits.
        </p>
      </div>

      <div className="overview-grid">
        <article className="surface-card overview-card">
          <p className="eyebrow">Urgent recommendations</p>
          <h2>{urgentCount}</h2>
          <p className="muted-copy">Highest priority items before the next freight cycle</p>
        </article>
        <article className="surface-card overview-card">
          <p className="eyebrow">Suggested order units</p>
          <h2>{suggestedUnits}</h2>
          <p className="muted-copy">Combined across all recommended line items</p>
        </article>
        <article className="surface-card overview-card">
          <p className="eyebrow">Pressure points</p>
          <h2>{lowOrCriticalCount}</h2>
          <p className="muted-copy">Inventory lines already at low or critical levels</p>
        </article>
        <article className="surface-card overview-card">
          <p className="eyebrow">Plan snapshot</p>
          <h2>{formatDate(lastGeneratedAt)}</h2>
          <p className="muted-copy">Last generated {formatDateTime(lastGeneratedAt)}</p>
        </article>
      </div>

      <div className="surface-card recommendation-callout">
        <div>
          <p className="eyebrow">Generate next month order plan</p>
          <h2>Refresh recommendations from the latest community and stock data</h2>
          <p className="muted-copy">
            {syncState.mode === 'connected'
              ? 'The clinic link is stable, so the refreshed order plan is ready to sync straight away.'
              : 'The clinic can still generate the plan offline. It will stay cached locally until sync improves.'}
          </p>
        </div>
        <button className="button button--primary" onClick={onGeneratePlan} type="button">
          Generate next month order plan
        </button>
      </div>

      <div className="recommendations-layout">
        <div className="list-stack">
          {recommendations.map((recommendation) => (
            <article key={recommendation.id} className="surface-card recommendation-card">
              <div className="recommendation-card__header">
                <div>
                  <p className="eyebrow">{recommendation.category}</p>
                  <h2>{recommendation.itemName}</h2>
                </div>
                <span
                  className={`status-badge status-badge--${recommendation.urgency.toLowerCase()}`}
                >
                  {recommendation.urgency}
                </span>
              </div>

              <div className="recommendation-metrics">
                <div>
                  <p className="detail-label">Suggested quantity</p>
                  <p className="metric-figure">
                    {recommendation.suggestedQuantity} {recommendation.unit}
                  </p>
                </div>
                <div>
                  <p className="detail-label">Current stock</p>
                  <p className="metric-figure">
                    {recommendation.currentStock} {recommendation.unit}
                  </p>
                </div>
                <div>
                  <p className="detail-label">Next delivery</p>
                  <p className="metric-figure">{formatDate(recommendation.nextDelivery)}</p>
                </div>
                <div>
                  <p className="detail-label">Stock status</p>
                  <p className="metric-figure">{recommendation.stockStatus}</p>
                </div>
              </div>

              <p className="muted-copy">{recommendation.reason}</p>

              <div className="driver-block">
                <p className="detail-label">Population groups driving this order</p>
                <div className="tag-list">
                  {recommendation.drivers.map((driver) => (
                    <span key={`${recommendation.id}-${driver}`} className="tag">
                      {driver}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="detail-column">
          <article className="surface-card">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Why these items rose to the top</p>
                <h2>Population drivers</h2>
              </div>
            </div>

            <div className="list-stack">
              {populationDrivers.map((driver) => (
                <article key={driver.id} className={`driver-card driver-card--${driver.tone}`}>
                  <div className="driver-card__header">
                    <div>
                      <h3>{driver.label}</h3>
                      <p>{driver.count} people or households influencing stock demand</p>
                    </div>
                    <span className="pill pill--outline">{driver.tone}</span>
                  </div>
                  <p className="muted-copy">{driver.description}</p>
                  <p className="detail-label">Linked items</p>
                  <div className="tag-list">
                    {driver.relatedItems.map((item) => (
                      <span key={`${driver.id}-${item}`} className="tag">
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="surface-card">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Planning notes</p>
                <h2>Low-connectivity assumptions</h2>
              </div>
            </div>
            <ul className="plain-list">
              <li>Records and stock edits are cached on-device for degraded clinic connectivity.</li>
              <li>Queued changes are shown clearly so staff can trust what still needs sync.</li>
              <li>Order planning stays rules-based and explainable for slide-ready presentation.</li>
              <li>Language and cultural support fields stay as placeholders for future co-design.</li>
            </ul>
          </article>
        </aside>
      </div>
    </section>
  )
}
