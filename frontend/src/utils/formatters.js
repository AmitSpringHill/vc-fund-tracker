export function formatCurrency(value) {
  if (value === null || value === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCurrencyShort(value) {
  if (value === null || value === undefined) return '$0';

  const absValue = Math.abs(value);

  if (absValue >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`;
  } else if (absValue >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else if (absValue >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }

  return formatCurrency(value);
}

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatQuarter(year, quarter) {
  return `Q${quarter} ${year}`;
}

export function formatMultiple(value) {
  if (value === null || value === undefined) return '0.00x';
  return `${value.toFixed(2)}x`;
}

export function formatPercentage(value) {
  if (value === null || value === undefined) return '0.00%';
  return `${value.toFixed(2)}%`;
}
