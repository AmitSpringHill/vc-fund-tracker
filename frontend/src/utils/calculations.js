export function calculateMultiple(cost, value) {
  if (!cost || cost === 0) return 0;
  return value / cost;
}

export function calculateTotalCost(investments) {
  return investments.reduce((sum, inv) => sum + (inv.cost || 0), 0);
}

export function calculateTotalValue(investments) {
  return investments.reduce((sum, inv) => sum + (inv.current_value || 0), 0);
}

export function calculateAverageMultiple(investments) {
  const totalCost = calculateTotalCost(investments);
  const totalValue = calculateTotalValue(investments);
  return calculateMultiple(totalCost, totalValue);
}

export function getQuarterEndDate(year, quarter) {
  const quarterEndMonths = { 1: '03-31', 2: '06-30', 3: '09-30', 4: '12-31' };
  return `${year}-${quarterEndMonths[quarter]}`;
}
