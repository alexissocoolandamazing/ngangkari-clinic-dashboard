import logoMark from '../assets/ngangkari-logo.svg'
import { connectivityOptions, dashboardTabs } from '../data'
import type { ConnectivityMode, SyncState, TabId } from '../types'

interface HeaderProps {
  activeTab: TabId
  activityMessage: string
  onConnectivityChange: (mode: ConnectivityMode) => void
  onTabChange: (tab: TabId) => void
  syncState: SyncState
}

const connectivityCopy: Record<ConnectivityMode, string> = {
  connected: 'Clinic link stable',
  degraded: 'Sync running in degraded mode',
  offline: 'Offline-ready mode',
}

export function Header({
  activeTab,
  activityMessage,
  onConnectivityChange,
  onTabChange,
  syncState,
}: HeaderProps) {
  return (
    <header className="top-header">
      <div className="top-header__inner">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true">
            <img alt="" src={logoMark} />
          </div>
          <div>
            <p className="brand-title">Ngangkari</p>
            <p className="brand-subtitle">Clinic Operations Dashboard</p>
            <p className="brand-copy">
              Population-aware planning for one remote community clinic, with
              offline-ready records, stock tracking, and clear monthly ordering support.
            </p>
            <div className="brand-pillrow">
              <span className="brand-pill">1 clinic</span>
              <span className="brand-pill">Monthly deliveries</span>
              <span className="brand-pill">Offline-ready workflow</span>
            </div>
          </div>
        </div>

        <div className="header-status">
          <div className="surface-card header-status__panel">
            <p className="eyebrow">Connectivity</p>
            <div className="header-status__row">
              <span className={`status-dot status-dot--${syncState.mode}`} />
              <strong>{connectivityCopy[syncState.mode]}</strong>
            </div>
            <p className="muted-copy">
              {syncState.mode === 'connected'
                ? 'Changes sync live while cached access stays available.'
                : 'Edits remain available locally and queue until service improves.'}
            </p>
          </div>

          <div className="surface-card header-status__panel header-status__panel--compact">
            <p className="eyebrow">Connection mode</p>
            <div className="segmented-control" role="tablist" aria-label="Connection mode">
              {connectivityOptions.map((option) => (
                <button
                  key={option.value}
                  className={
                    option.value === syncState.mode
                      ? 'segment is-active'
                      : 'segment'
                  }
                  onClick={() => onConnectivityChange(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="top-header__footer">
        <nav className="tab-nav" aria-label="Clinic dashboard sections">
          {dashboardTabs.map((tab) => (
            <button
              key={tab.id}
              className={tab.id === activeTab ? 'tab-button is-active' : 'tab-button'}
              onClick={() => onTabChange(tab.id)}
              type="button"
            >
              <span>{tab.label}</span>
              <small>{tab.helper}</small>
            </button>
          ))}
        </nav>

        <p className="header-activity" aria-live="polite">
          {activityMessage}
        </p>
      </div>
    </header>
  )
}
