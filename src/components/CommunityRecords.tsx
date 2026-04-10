import { useDeferredValue, useState, type FormEvent } from 'react'
import { residentTagOptions } from '../data'
import type { Resident, ResidentTag } from '../types'
import { formatDate } from '../utils/clinic'

interface CommunityRecordsProps {
  residents: Resident[]
  onSaveResident: (resident: Resident) => void
}

interface ResidentFormState {
  id?: string
  fullName: string
  age: string
  gender: string
  heightCm: string
  weightKg: string
  household: string
  tags: ResidentTag[]
  conditions: string
  allergies: string
  medications: string
  clinicNeeds: string
  riskNotes: string
  lastContact: string
  notes: string
  communicationSupport: string
}

type ResidentFilterMode = 'any' | 'all'
type ResidentSortMode = 'recent' | 'name' | 'age-desc' | 'household'

function createResidentForm(resident?: Resident): ResidentFormState {
  if (!resident) {
    return {
      fullName: '',
      age: '',
      gender: '',
      heightCm: '',
      weightKg: '',
      household: '',
      tags: [],
      conditions: '',
      allergies: '',
      medications: '',
      clinicNeeds: '',
      riskNotes: '',
      lastContact: '2026-04-09',
      notes: '',
      communicationSupport:
        'Placeholder for language, family, or cultural support preferences.',
    }
  }

  return {
    id: resident.id,
    fullName: resident.fullName,
    age: String(resident.age),
    gender: resident.gender,
    heightCm: resident.heightCm ? String(resident.heightCm) : '',
    weightKg: resident.weightKg ? String(resident.weightKg) : '',
    household: resident.household,
    tags: resident.tags,
    conditions: resident.conditions.join(', '),
    allergies: resident.allergies.join(', '),
    medications: resident.medications.join(', '),
    clinicNeeds: resident.clinicNeeds.join(', '),
    riskNotes: resident.riskNotes,
    lastContact: resident.lastContact,
    notes: resident.notes,
    communicationSupport: resident.communicationSupport,
  }
}

function splitValues(value: string) {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

export function CommunityRecords({
  residents,
  onSaveResident,
}: CommunityRecordsProps) {
  const [searchValue, setSearchValue] = useState('')
  const [selectedTags, setSelectedTags] = useState<ResidentTag[]>([])
  const [filterMode, setFilterMode] = useState<ResidentFilterMode>('any')
  const [sortMode, setSortMode] = useState<ResidentSortMode>('recent')
  const [selectedResidentId, setSelectedResidentId] = useState(residents[0]?.id ?? '')
  const [formState, setFormState] = useState<ResidentFormState>(() =>
    createResidentForm(),
  )
  const deferredSearchValue = useDeferredValue(searchValue)

  const filteredResidents = residents
    .filter((resident) => {
      const searchTarget = [
        resident.fullName,
        resident.household,
        resident.conditions.join(' '),
        resident.tags.join(' '),
        resident.allergies.join(' '),
        resident.medications.join(' '),
        resident.clinicNeeds.join(' '),
        resident.riskNotes,
        resident.notes,
        resident.communicationSupport,
      ]
        .join(' ')
        .toLowerCase()

      const matchesSearch =
        deferredSearchValue.trim().length === 0 ||
        searchTarget.includes(deferredSearchValue.toLowerCase())
      const matchesTags =
        selectedTags.length === 0 ||
        (filterMode === 'all'
          ? selectedTags.every((tag) => resident.tags.includes(tag))
          : selectedTags.some((tag) => resident.tags.includes(tag)))

      return matchesSearch && matchesTags
    })
    .sort((left, right) => {
      switch (sortMode) {
        case 'name':
          return left.fullName.localeCompare(right.fullName)
        case 'age-desc':
          return right.age - left.age
        case 'household':
          return left.household.localeCompare(right.household)
        case 'recent':
        default:
          return (
            new Date(right.lastContact).getTime() - new Date(left.lastContact).getTime()
          )
      }
    })

  const hasSearchFilter = deferredSearchValue.trim().length > 0
  const hasTagFilters = selectedTags.length > 0
  const activeFilterCount = selectedTags.length + (hasSearchFilter ? 1 : 0)
  const activeSelectedResidentId =
    filteredResidents.find((resident) => resident.id === selectedResidentId)?.id ??
    filteredResidents[0]?.id ??
    ''
  const selectedResident = filteredResidents.find(
    (resident) => resident.id === activeSelectedResidentId,
  )
  const tagCountByLabel = Object.fromEntries(
    residentTagOptions.map((tag) => [
      tag,
      residents.filter((resident) => resident.tags.includes(tag)).length,
    ]),
  ) as Record<ResidentTag, number>

  function handleResidentFilterToggle(tag: ResidentTag) {
    setSelectedTags((previous) =>
      previous.includes(tag)
        ? previous.filter((entry) => entry !== tag)
        : [...previous, tag],
    )
  }

  function clearFilters() {
    setSearchValue('')
    setSelectedTags([])
    setFilterMode('any')
  }

  function handleTagToggle(tag: ResidentTag) {
    setFormState((previous) => ({
      ...previous,
      tags: previous.tags.includes(tag)
        ? previous.tags.filter((entry) => entry !== tag)
        : [...previous.tags, tag],
    }))
  }

  function handleEditResident(resident: Resident) {
    setFormState(createResidentForm(resident))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const resident: Resident = {
      id: formState.id ?? `resident-${crypto.randomUUID()}`,
      fullName: formState.fullName.trim(),
      age: Number(formState.age),
      gender: formState.gender.trim(),
      heightCm: formState.heightCm ? Number(formState.heightCm) : undefined,
      weightKg: formState.weightKg ? Number(formState.weightKg) : undefined,
      household: formState.household.trim(),
      tags: formState.tags,
      conditions: splitValues(formState.conditions),
      allergies: splitValues(formState.allergies),
      medications: splitValues(formState.medications),
      clinicNeeds: splitValues(formState.clinicNeeds),
      riskNotes: formState.riskNotes.trim(),
      lastContact: formState.lastContact,
      notes: formState.notes.trim(),
      communicationSupport: formState.communicationSupport.trim(),
    }

    onSaveResident(resident)
    setSelectedResidentId(resident.id)
    setFormState(createResidentForm())
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Community-aware records</p>
          <h1>Simple resident and household tracking for one small clinic</h1>
        </div>
        <p className="muted-copy">
          Keep practical household context close to the medical essentials so staff
          can plan visits, transport, and supply needs without managing a full
          hospital record system.
        </p>
      </div>

      <div className="surface-card control-card">
        <label className="search-field">
          <span className="search-label">Search residents or households</span>
          <input
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search by name, property, condition, medication, or support note"
            type="search"
            value={searchValue}
          />
        </label>

        <div className="control-toolbar">
          <div className="filter-summary">
            <strong>
              {filteredResidents.length} matching record
              {filteredResidents.length === 1 ? '' : 's'}
            </strong>
            <p className="muted-copy">
              {hasSearchFilter
                ? 'Search is checking names, households, conditions, medications, clinic needs, and support notes.'
                : 'Search all community records by person, household, health needs, or support notes.'}
            </p>
          </div>

          <div className="filter-actions">
            <label className="select-field">
              <span className="search-label">Tag matching</span>
              <select
                disabled={selectedTags.length < 2}
                onChange={(event) =>
                  setFilterMode(event.target.value as ResidentFilterMode)
                }
                value={filterMode}
              >
                <option value="any">Match any selected tag</option>
                <option value="all">Match all selected tags</option>
              </select>
            </label>

            <label className="select-field">
              <span className="search-label">Sort records</span>
              <select
                onChange={(event) =>
                  setSortMode(event.target.value as ResidentSortMode)
                }
                value={sortMode}
              >
                <option value="recent">Most recent contact</option>
                <option value="name">Name A-Z</option>
                <option value="age-desc">Oldest first</option>
                <option value="household">Household A-Z</option>
              </select>
            </label>
          </div>
        </div>

        <div className="filter-meta">
          <span className="pill pill--muted">
            {hasTagFilters
              ? `${selectedTags.length} active tag filter${selectedTags.length === 1 ? '' : 's'}`
              : 'No tag filters'}
            {selectedTags.length > 1 ? ` • Match ${filterMode}` : ''}
          </span>
          {activeFilterCount > 0 ? (
            <button
              className="button button--ghost button--compact"
              onClick={clearFilters}
              type="button"
            >
              Clear filters
            </button>
          ) : null}
        </div>

        <div className="chip-row chip-row--filters" aria-label="Resident filters">
          <button
            aria-pressed={selectedTags.length === 0}
            className={selectedTags.length === 0 ? 'chip is-active' : 'chip'}
            onClick={() => setSelectedTags([])}
            type="button"
          >
            <span>All records</span>
          </button>
          {residentTagOptions.map((tag) => (
            <button
              key={tag}
              aria-pressed={selectedTags.includes(tag)}
              className={selectedTags.includes(tag) ? 'chip is-active' : 'chip'}
              onClick={() => handleResidentFilterToggle(tag)}
              type="button"
            >
              <span>{tag}</span>
              <span className="chip-count">{tagCountByLabel[tag]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="records-layout">
        <div className="surface-card">
          <div className="panel-header">
            <div>
              <h2>Community records</h2>
              <p className="muted-copy">
                {filteredResidents.length} resident record
                {filteredResidents.length === 1 ? '' : 's'} in view
              </p>
            </div>
            <button
              className="button button--primary"
              onClick={() => setFormState(createResidentForm())}
              type="button"
            >
              Add new person
            </button>
          </div>

          <div className="list-stack">
            {filteredResidents.length > 0 ? (
              filteredResidents.map((resident) => (
                <button
                  key={resident.id}
                  className={
                    resident.id === activeSelectedResidentId
                      ? 'record-card is-selected'
                      : 'record-card'
                  }
                  onClick={() => setSelectedResidentId(resident.id)}
                  type="button"
                >
                  <div className="record-card__header">
                    <div>
                      <h3>{resident.fullName}</h3>
                      <p>
                        {resident.age} years / {resident.gender} / {resident.household}
                      </p>
                    </div>
                    <span className="pill pill--outline">
                      Last contact {formatDate(resident.lastContact)}
                    </span>
                  </div>
                  <div className="tag-list">
                    {resident.tags.map((tag) => (
                      <span key={`${resident.id}-${tag}`} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="muted-copy">
                    <strong>Common clinic needs:</strong> {resident.clinicNeeds.join(', ')}
                  </p>
                </button>
              ))
            ) : (
              <div className="empty-state">
                <h3>No residents match these filters</h3>
                <p className="muted-copy">
                  Try clearing a tag, switching to match any, or broadening the search.
                </p>
                <button
                  className="button button--ghost button--compact"
                  onClick={clearFilters}
                  type="button"
                >
                  Reset resident filters
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="detail-column">
          <article className="surface-card detail-card">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Selected record</p>
                <h2>{selectedResident?.fullName ?? 'Select a resident'}</h2>
              </div>
              {selectedResident ? (
                <button
                  className="button button--ghost"
                  onClick={() => handleEditResident(selectedResident)}
                  type="button"
                >
                  Edit selected
                </button>
              ) : null}
            </div>

            {selectedResident ? (
              <div className="detail-stack">
                <div className="detail-grid">
                  <div>
                    <p className="detail-label">Household / property</p>
                    <p>{selectedResident.household}</p>
                  </div>
                  <div>
                    <p className="detail-label">Profile</p>
                    <p>
                      {selectedResident.age} years / {selectedResident.gender}
                      {selectedResident.heightCm
                        ? ` / ${selectedResident.heightCm} cm`
                        : ''}
                      {selectedResident.weightKg
                        ? ` / ${selectedResident.weightKg} kg`
                        : ''}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="detail-label">Category tags</p>
                  <div className="tag-list">
                    {selectedResident.tags.map((tag) => (
                      <span key={`${selectedResident.id}-detail-${tag}`} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="detail-grid">
                  <div>
                    <p className="detail-label">Known conditions</p>
                    <ul className="plain-list">
                      {selectedResident.conditions.map((condition) => (
                        <li key={`${selectedResident.id}-${condition}`}>{condition}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="detail-label">Current medications</p>
                    <ul className="plain-list">
                      {selectedResident.medications.map((medication) => (
                        <li key={`${selectedResident.id}-${medication}`}>{medication}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="detail-grid">
                  <div>
                    <p className="detail-label">Allergies</p>
                    <ul className="plain-list">
                      {selectedResident.allergies.map((allergy) => (
                        <li key={`${selectedResident.id}-${allergy}`}>{allergy}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="detail-label">Common clinic needs</p>
                    <ul className="plain-list">
                      {selectedResident.clinicNeeds.map((need) => (
                        <li key={`${selectedResident.id}-${need}`}>{need}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <p className="detail-label">Vulnerability and risk notes</p>
                  <p>{selectedResident.riskNotes}</p>
                </div>

                <div>
                  <p className="detail-label">Free-text notes</p>
                  <p>{selectedResident.notes}</p>
                </div>

                <div className="support-callout">
                  <p className="detail-label">Communication / cultural support</p>
                  <p>{selectedResident.communicationSupport}</p>
                </div>
              </div>
            ) : (
              <p className="muted-copy">
                Select a resident card to review the clinic-ready detail panel.
              </p>
            )}
          </article>

          <article className="surface-card">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Add or update</p>
                <h2>{formState.id ? 'Update resident record' : 'New resident record'}</h2>
              </div>
            </div>

            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Full name
                <input
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      fullName: event.target.value,
                    }))
                  }
                  required
                  type="text"
                  value={formState.fullName}
                />
              </label>
              <label>
                Age
                <input
                  min="0"
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      age: event.target.value,
                    }))
                  }
                  required
                  type="number"
                  value={formState.age}
                />
              </label>
              <label>
                Sex / gender
                <input
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      gender: event.target.value,
                    }))
                  }
                  required
                  type="text"
                  value={formState.gender}
                />
              </label>
              <label>
                Household / location
                <input
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      household: event.target.value,
                    }))
                  }
                  required
                  type="text"
                  value={formState.household}
                />
              </label>
              <label>
                Height (cm)
                <input
                  min="0"
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      heightCm: event.target.value,
                    }))
                  }
                  type="number"
                  value={formState.heightCm}
                />
              </label>
              <label>
                Weight (kg)
                <input
                  min="0"
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      weightKg: event.target.value,
                    }))
                  }
                  step="0.1"
                  type="number"
                  value={formState.weightKg}
                />
              </label>
              <label>
                Last visit / last contact
                <input
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      lastContact: event.target.value,
                    }))
                  }
                  required
                  type="date"
                  value={formState.lastContact}
                />
              </label>

              <fieldset className="chip-fieldset">
                <legend>Category tags</legend>
                <div className="chip-row">
                  {residentTagOptions.map((tag) => (
                    <button
                      key={`form-${tag}`}
                      aria-pressed={formState.tags.includes(tag)}
                      className={formState.tags.includes(tag) ? 'chip is-active' : 'chip'}
                      onClick={() => handleTagToggle(tag)}
                      type="button"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="form-grid__full">
                Known medical conditions
                <textarea
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      conditions: event.target.value,
                    }))
                  }
                  placeholder="Comma-separated"
                  rows={3}
                  value={formState.conditions}
                />
              </label>
              <label>
                Allergies
                <textarea
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      allergies: event.target.value,
                    }))
                  }
                  placeholder="Comma-separated"
                  rows={3}
                  value={formState.allergies}
                />
              </label>
              <label>
                Current medications
                <textarea
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      medications: event.target.value,
                    }))
                  }
                  placeholder="Comma-separated"
                  rows={3}
                  value={formState.medications}
                />
              </label>
              <label>
                Common clinic needs
                <textarea
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      clinicNeeds: event.target.value,
                    }))
                  }
                  placeholder="Comma-separated"
                  rows={3}
                  value={formState.clinicNeeds}
                />
              </label>
              <label>
                Vulnerability / risk notes
                <textarea
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      riskNotes: event.target.value,
                    }))
                  }
                  rows={3}
                  value={formState.riskNotes}
                />
              </label>
              <label className="form-grid__full">
                Free-text notes
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
              <label className="form-grid__full">
                Language / cultural support placeholder
                <textarea
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      communicationSupport: event.target.value,
                    }))
                  }
                  rows={3}
                  value={formState.communicationSupport}
                />
              </label>

              <div className="form-actions form-grid__full">
                <button className="button button--primary" type="submit">
                  {formState.id ? 'Save record' : 'Create record'}
                </button>
                <button
                  className="button button--ghost"
                  onClick={() => setFormState(createResidentForm())}
                  type="button"
                >
                  Clear form
                </button>
              </div>
            </form>
          </article>
        </div>
      </div>
    </section>
  )
}
