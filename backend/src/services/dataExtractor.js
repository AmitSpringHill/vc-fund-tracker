const { parse, isValid } = require('date-fns');

const patterns = {
  table1: /([A-Za-z][A-Za-z0-9\s&.,'-]+?)\s+(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}|[A-Z][a-z]+\s+\d{1,2},?\s+\d{4})?\s+\$?\s*([\d,]+\.?\d*)\s+\$?\s*([\d,]+\.?\d*)/gi,

  table2: /([A-Za-z][A-Za-z0-9\s&.,'-]+?)\s+(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2})?\s+([0-9,]+(?:\.[0-9]{1,2})?)\s+([0-9,]+(?:\.[0-9]{1,2})?)/gi,

  companyCostValue: /([A-Za-z][A-Za-z0-9\s&.,'-]{2,40})\s+(?:Cost|Investment):\s*\$?\s*([\d,]+\.?\d*)\s+(?:Value|Current\s+Value):\s*\$?\s*([\d,]+\.?\d*)/gi,

  tableWithHeaders: /Company[^\n]*\n((?:[A-Za-z][^\n]+\n)+)/gi
};

function parseFlexibleDate(dateStr, quarterYear, quarter) {
  if (!dateStr || dateStr.trim() === '') {
    return getQuarterEndDate(quarterYear, quarter);
  }

  dateStr = dateStr.trim();

  const formats = [
    'yyyy-MM-dd',
    'MM/dd/yyyy',
    'M/d/yyyy',
    'MM/dd/yy',
    'M/d/yy',
    'dd/MM/yyyy',
    'd/M/yyyy',
    'MMMM dd, yyyy',
    'MMMM d, yyyy',
    'MMM dd, yyyy',
    'MMM d, yyyy',
    'yyyy/MM/dd',
    'M-d-yyyy',
    'MM-dd-yyyy'
  ];

  for (const format of formats) {
    try {
      const date = parse(dateStr, format, new Date());
      if (isValid(date)) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      continue;
    }
  }

  return getQuarterEndDate(quarterYear, quarter);
}

function getQuarterEndDate(year, quarter) {
  const quarterEndMonths = { 1: '03-31', 2: '06-30', 3: '09-30', 4: '12-31' };
  return `${year}-${quarterEndMonths[quarter]}`;
}

function parseNumber(str) {
  if (!str) return 0;
  const cleaned = str.toString().replace(/[$,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function tryPattern(text, pattern, year, quarter) {
  const matches = [];
  let match;

  while ((match = pattern.exec(text)) !== null) {
    const companyName = match[1]?.trim();
    const dateStr = match[2];
    const costStr = match[3];
    const valueStr = match[4];

    if (!companyName || companyName.length < 2) continue;

    if (companyName.match(/^(Total|Subtotal|TOTAL|SUBTOTAL|Page|Date|Quarter|Fund|Report|Portfolio|Summary)/i)) {
      continue;
    }

    const cost = parseNumber(costStr);
    const currentValue = parseNumber(valueStr);

    if (cost === 0 || currentValue === 0) continue;
    if (cost > 10000000000 || currentValue > 10000000000) continue;

    const investmentDate = parseFlexibleDate(dateStr, year, quarter);

    matches.push({
      company_name: companyName,
      investment_date: investmentDate,
      cost: cost,
      current_value: currentValue
    });
  }

  return matches;
}

function extractInvestments(text, year, quarter) {
  const results = [];

  for (const [patternName, pattern] of Object.entries(patterns)) {
    const matches = tryPattern(text, pattern, year, quarter);
    if (matches.length > 0) {
      console.log(`Pattern ${patternName} found ${matches.length} matches`);
      results.push(...matches);
    }
    pattern.lastIndex = 0;
  }

  const uniqueInvestments = [];
  const seen = new Set();

  for (const inv of results) {
    const key = `${inv.company_name.toLowerCase()}-${inv.cost}-${inv.current_value}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueInvestments.push(inv);
    }
  }

  return {
    success: uniqueInvestments.length > 0,
    investments: uniqueInvestments,
    count: uniqueInvestments.length
  };
}

function extractFundName(text) {
  const lines = text.split('\n').slice(0, 50);

  const fundPatterns = [
    /Fund Name:\s*(.+)/i,
    /Fund:\s*([A-Za-z0-9\s&,.-]+(?:Fund|Capital|Ventures|Partners|LP|L\.P\.))/i,
    /^([A-Za-z0-9\s&,.-]+(?:Fund|Capital|Ventures|Partners|LP|L\.P\.))\s*$/im,
    /Portfolio Report\s*[-–—]\s*(.+?)(?:\n|Quarter|Report|Date)/i,
    /Quarterly Report\s*[-–—]\s*(.+?)(?:\n|Quarter|Q\d)/i,
  ];

  for (const pattern of fundPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      let fundName = match[1].trim();
      fundName = fundName.replace(/\s+/g, ' ');

      if (fundName.length > 5 && fundName.length < 100) {
        return fundName;
      }
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.match(/(?:Fund|Capital|Ventures|Partners|LP|L\.P\.)/i) &&
        trimmed.length > 5 &&
        trimmed.length < 100 &&
        !trimmed.match(/page|date|report|quarter|period|ended|as of/i)) {
      return trimmed;
    }
  }

  return null;
}

function extractQuarterInfo(text) {
  const quarterPatterns = [
    /Quarter\s+(\d)\s*,?\s*(\d{4})/i,
    /Q(\d)\s*(\d{4})/i,
    /(\d{4})\s*Q(\d)/i,
    /Quarter\s+Ended?\s*:?\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/i,
    /Period\s+Ended?\s*:?\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/i,
    /As\s+of\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/i,
    /For\s+the\s+Quarter\s+Ended\s+(\w+)\s+(\d{1,2}),?\s+(\d{4})/i,
    /March\s+31,?\s+(\d{4})/i,
    /June\s+30,?\s+(\d{4})/i,
    /September\s+30,?\s+(\d{4})/i,
    /December\s+31,?\s+(\d{4})/i,
  ];

  for (const pattern of quarterPatterns) {
    const match = text.match(pattern);
    if (match) {
      if (pattern.source.includes('Quarter\\s+(\\d)') || pattern.source.includes('Q(\\d)')) {
        return {
          quarter: parseInt(match[1]),
          year: parseInt(match[2])
        };
      }

      if (pattern.source.includes('(\\d{4})\\s*Q(\\d)')) {
        return {
          quarter: parseInt(match[2]),
          year: parseInt(match[1])
        };
      }

      if (match[3] && match[3].length === 4) {
        const month = parseInt(match[1]);
        const year = parseInt(match[3]);
        const quarter = Math.ceil(month / 3);
        return { quarter, year };
      }

      if (pattern.source.includes('March')) {
        return { quarter: 1, year: parseInt(match[1]) };
      }
      if (pattern.source.includes('June')) {
        return { quarter: 2, year: parseInt(match[1]) };
      }
      if (pattern.source.includes('September')) {
        return { quarter: 3, year: parseInt(match[1]) };
      }
      if (pattern.source.includes('December')) {
        return { quarter: 4, year: parseInt(match[1]) };
      }
    }
  }

  return null;
}

function extractMetadata(text) {
  const fundName = extractFundName(text);
  const quarterInfo = extractQuarterInfo(text);

  return {
    fundName: fundName,
    year: quarterInfo?.year || null,
    quarter: quarterInfo?.quarter || null,
    success: !!(fundName || quarterInfo)
  };
}

module.exports = {
  extractInvestments,
  parseFlexibleDate,
  getQuarterEndDate,
  parseNumber,
  extractFundName,
  extractQuarterInfo,
  extractMetadata
};
