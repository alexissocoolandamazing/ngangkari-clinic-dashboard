import type {
  InventoryItem,
  InventoryStatus,
  OrderRecommendation,
  PopulationDriver,
  RecommendationUrgency,
  Resident,
  ResidentTag,
} from '../types'

function countResidentsByTag(residents: Resident[], tag: ResidentTag) {
  return residents.filter((resident) => resident.tags.includes(tag)).length
}

function countResidentsByCondition(residents: Resident[], keywords: string[]) {
  return residents.filter((resident) =>
    resident.conditions.some((condition) =>
      keywords.some((keyword) => condition.toLowerCase().includes(keyword)),
    ),
  ).length
}

function roundUp(quantity: number, packSize: number) {
  return Math.ceil(quantity / packSize) * packSize
}

export function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(dateString))
}

export function formatDateTime(dateString: string) {
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export function daysUntilDelivery(dateString: string) {
  const today = new Date('2026-04-09T00:00:00+10:00')
  const deliveryDate = new Date(dateString)
  const millisecondsPerDay = 1000 * 60 * 60 * 24
  return Math.max(
    0,
    Math.ceil((deliveryDate.getTime() - today.getTime()) / millisecondsPerDay),
  )
}

export function getInventoryStatus(item: InventoryItem): InventoryStatus {
  if (item.quantity <= Math.max(1, Math.floor(item.reorderThreshold * 0.6))) {
    return 'Critical'
  }

  if (item.quantity <= item.reorderThreshold) {
    return 'Low'
  }

  return 'Healthy'
}

export function getCoverageMonths(item: InventoryItem) {
  if (item.monthlyUsage <= 0) {
    return 0
  }

  return item.quantity / item.monthlyUsage
}

function getUrgency(
  item: InventoryItem,
  suggestedQuantity: number,
  shortage: number,
): RecommendationUrgency {
  const status = getInventoryStatus(item)
  const days = daysUntilDelivery(item.nextDelivery)
  const coverage = getCoverageMonths(item)
  let score = 0

  if (status === 'Critical') {
    score += 2
  } else if (status === 'Low') {
    score += 1
  }

  if (coverage < 0.9) {
    score += 2
  } else if (coverage < 1.2) {
    score += 1
  }

  if (days > 18) {
    score += 1
  }

  if (shortage > item.reorderThreshold || suggestedQuantity >= item.monthlyUsage) {
    score += 1
  }

  if (score >= 4) {
    return 'Urgent'
  }

  if (score >= 2) {
    return 'Watch'
  }

  return 'Routine'
}

function createRecommendation(
  item: InventoryItem | undefined,
  suggestedQuantity: number,
  reason: string,
  drivers: string[],
): OrderRecommendation | null {
  if (!item || suggestedQuantity <= 0) {
    return null
  }

  const shortage = Math.max(0, item.reorderThreshold + suggestedQuantity - item.quantity)
  return {
    id: `recommend-${item.id}`,
    itemId: item.id,
    itemName: item.name,
    category: item.category,
    urgency: getUrgency(item, suggestedQuantity, shortage),
    suggestedQuantity,
    unit: item.unit,
    shortage,
    reason,
    drivers,
    currentStock: item.quantity,
    nextDelivery: item.nextDelivery,
    stockStatus: getInventoryStatus(item),
  }
}

export function buildOrderRecommendations(
  residents: Resident[],
  inventory: InventoryItem[],
) {
  const itemMap = new Map(inventory.map((item) => [item.id, item]))
  const elderlyCount = countResidentsByTag(residents, 'elderly')
  const chronicCount = countResidentsByTag(residents, 'chronic illness')
  const diabetesCount = countResidentsByCondition(residents, ['diabetes'])
  const respiratoryCount = countResidentsByCondition(residents, ['asthma', 'copd'])
  const youngFamilyCount = countResidentsByTag(residents, 'young family')
  const childCount = countResidentsByTag(residents, 'child')
  const maternalCount = countResidentsByTag(residents, 'pregnancy/maternal support')
  const farmRiskCount = countResidentsByTag(residents, 'farm injury risk')

  const glucoseItem = itemMap.get('glucose-strips')
  const dressingItem = itemMap.get('sterile-dressings')
  const splintItem = itemMap.get('sam-splints')
  const antenatalItem = itemMap.get('antenatal-packs')
  const hydrationItem = itemMap.get('oral-rehydration')
  const inhalerItem = itemMap.get('salbutamol')
  const traumaItem = itemMap.get('trauma-kits')

  const glucoseBase = diabetesCount * 90 + chronicCount * 15 + elderlyCount * 10
  const glucoseSuggested =
    glucoseItem && glucoseBase + glucoseItem.reorderThreshold > glucoseItem.quantity
      ? roundUp(glucoseBase + glucoseItem.reorderThreshold - glucoseItem.quantity, 25)
      : 0

  const dressingBase = farmRiskCount * 10 + Math.max(1, chronicCount - 1) * 4
  const dressingSuggested =
    dressingItem && dressingBase + dressingItem.reorderThreshold > dressingItem.quantity
      ? roundUp(dressingBase + dressingItem.reorderThreshold - dressingItem.quantity, 5)
      : 0

  const splintBase = farmRiskCount * 2 + 2
  const splintSuggested =
    splintItem && splintBase + splintItem.reorderThreshold > splintItem.quantity
      ? roundUp(splintBase + splintItem.reorderThreshold - splintItem.quantity, 1)
      : 0

  const antenatalBase = maternalCount * 6 + youngFamilyCount * 2
  const antenatalSuggested =
    antenatalItem && antenatalBase + antenatalItem.reorderThreshold > antenatalItem.quantity
      ? roundUp(antenatalBase + antenatalItem.reorderThreshold - antenatalItem.quantity, 2)
      : 0

  const hydrationBase = childCount * 8 + youngFamilyCount * 5 + elderlyCount * 3
  const hydrationSuggested =
    hydrationItem && hydrationBase + hydrationItem.reorderThreshold > hydrationItem.quantity
      ? roundUp(hydrationBase + hydrationItem.reorderThreshold - hydrationItem.quantity, 5)
      : 0

  const inhalerBase = respiratoryCount * 3 + childCount
  const inhalerSuggested =
    inhalerItem && inhalerBase + inhalerItem.reorderThreshold > inhalerItem.quantity
      ? roundUp(inhalerBase + inhalerItem.reorderThreshold - inhalerItem.quantity, 1)
      : 0

  const traumaBase = farmRiskCount * 2 + 2
  const traumaSuggested =
    traumaItem && traumaBase + traumaItem.reorderThreshold > traumaItem.quantity
      ? roundUp(traumaBase + traumaItem.reorderThreshold - traumaItem.quantity, 1)
      : 0

  const recommendations = [
    createRecommendation(
      glucoseItem,
      glucoseSuggested,
      'Higher chronic care demand means the clinic should extend its diabetes monitoring buffer before the next monthly delivery.',
      [
        `${diabetesCount} residents currently managing diabetes`,
        `${elderlyCount} elderly residents with routine monitoring needs`,
      ].filter((driver) => !driver.startsWith('0 ')),
    ),
    createRecommendation(
      dressingItem,
      dressingSuggested,
      'Wound care demand is elevated by farm injury exposure and ongoing dressing changes across chronic care follow-ups.',
      [
        `${farmRiskCount} residents flagged for farm injury risk`,
        `${chronicCount} residents likely to need wound review or protective dressing support`,
      ].filter((driver) => !driver.startsWith('0 ')),
    ),
    createRecommendation(
      splintItem,
      splintSuggested,
      'A small clinic reserve of splints helps cover station incidents when retrieval or transfer is delayed.',
      [
        `${farmRiskCount} residents with machinery or stock handling exposure`,
        `Only ${splintItem?.quantity ?? 0} splints currently tracked on hand`,
      ],
    ),
    createRecommendation(
      antenatalItem,
      antenatalSuggested,
      'Maternal support planning should keep nutrition and pregnancy consumables ahead of the delivery cycle.',
      [
        `${maternalCount} residents currently flagged for pregnancy or maternal support`,
        `${youngFamilyCount} households needing family-centred clinic planning`,
      ].filter((driver) => !driver.startsWith('0 ')),
    ),
    createRecommendation(
      hydrationItem,
      hydrationSuggested,
      'Young families, children, and older residents raise the need for reliable hydration support during heat and illness spikes.',
      [
        `${childCount} child records currently active`,
        `${youngFamilyCount} young family households`,
        `${elderlyCount} elderly residents needing additional resilience planning`,
      ].filter((driver) => !driver.startsWith('0 ')),
    ),
    createRecommendation(
      inhalerItem,
      inhalerSuggested,
      'Respiratory demand stays sensitive to dust, cold air, and supply gaps, so the clinic should maintain an accessible inhaler buffer.',
      [
        `${respiratoryCount} residents with asthma or COPD recorded`,
        `${childCount} child records that may need quick respiratory support`,
      ].filter((driver) => !driver.startsWith('0 ')),
    ),
    createRecommendation(
      traumaItem,
      traumaSuggested,
      'Remote property incidents can consume the trauma reserve quickly, so the next order should rebuild buffer stock.',
      [
        `${farmRiskCount} residents with high injury exposure`,
        `${daysUntilDelivery(traumaItem?.nextDelivery ?? '2026-04-29')} days until the next scheduled delivery`,
      ],
    ),
  ].filter((recommendation): recommendation is OrderRecommendation => recommendation !== null)

  return recommendations.sort((left, right) => {
    const urgencyRank = { Urgent: 0, Watch: 1, Routine: 2 }
    return (
      urgencyRank[left.urgency] - urgencyRank[right.urgency] ||
      right.suggestedQuantity - left.suggestedQuantity
    )
  })
}

export function buildPopulationDrivers(residents: Resident[]): PopulationDriver[] {
  const elderlyCount = countResidentsByTag(residents, 'elderly')
  const chronicCount = countResidentsByTag(residents, 'chronic illness')
  const maternalCount = countResidentsByTag(residents, 'pregnancy/maternal support')
  const youngFamilyCount = countResidentsByTag(residents, 'young family')
  const childCount = countResidentsByTag(residents, 'child')
  const farmRiskCount = countResidentsByTag(residents, 'farm injury risk')
  const respiratoryCount = countResidentsByCondition(residents, ['asthma', 'copd'])
  const diabetesCount = countResidentsByCondition(residents, ['diabetes'])

  const drivers: PopulationDriver[] = [
    {
      id: 'driver-chronic-care',
      label: 'Elderly and chronic care households',
      count: elderlyCount + chronicCount,
      description:
        'Monitoring consumables and medication support stay important because several residents need regular chronic disease review.',
      relatedItems: ['Glucose test strips', 'Salbutamol inhalers'],
      tone: diabetesCount > 1 ? 'urgent' : 'watch',
    },
    {
      id: 'driver-maternal',
      label: 'Pregnancy and young family support',
      count: maternalCount + youngFamilyCount,
      description:
        'Antenatal packs, hydration support, and family-friendly supply buffers reduce missed care when travel or weather changes suddenly.',
      relatedItems: ['Antenatal nutrition packs', 'Infant oral rehydration sachets'],
      tone: maternalCount > 0 ? 'watch' : 'support',
    },
    {
      id: 'driver-farm-risk',
      label: 'Farm and station injury exposure',
      count: farmRiskCount,
      description:
        'Remote incidents can drain wound care and trauma stock fast, especially when the clinic must stabilise before transfer.',
      relatedItems: ['Sterile dressing packs', 'SAM splints', 'First-response trauma kits'],
      tone: farmRiskCount >= 3 ? 'urgent' : 'watch',
    },
    {
      id: 'driver-children',
      label: 'Children and respiratory follow-up',
      count: childCount + respiratoryCount,
      description:
        'Child-friendly respiratory care and hydration support help the clinic respond early when weather and dust conditions worsen.',
      relatedItems: ['Salbutamol inhalers', 'Infant oral rehydration sachets'],
      tone: respiratoryCount > 0 ? 'watch' : 'support',
    },
  ]

  return drivers.filter((driver) => driver.count > 0)
}
