const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function extractWithClaude(pdfText) {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_api_key_here') {
    throw new Error('ANTHROPIC_API_KEY is not configured. Please add your API key to the .env file.');
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `You are a financial data extraction expert. Extract structured investment data from this VC fund quarterly report.

PDF Text:
${pdfText}

Extract the following information and return ONLY a valid JSON object (no markdown, no explanations):

{
  "fundName": "the fund name (e.g., 'Tech Ventures Fund I', 'Innovation Capital LP')",
  "year": 2024,
  "quarter": 1,
  "capital_commitments": 50000000.00,
  "management_fees": 125000.00,
  "operating_costs": 50000.00,
  "formation_costs": 25000.00,
  "investments": [
    {
      "company_name": "Company Name",
      "investment_date": "YYYY-MM-DD or null if not available",
      "cost": 1000000.00,
      "current_value": 1500000.00
    }
  ]
}

Rules:
1. Fund name: Look for words like "Fund", "Capital", "Ventures", "Partners", "LP", "L.P." in the header/title
2. Quarter: Look for "Q1", "Q2", "Q3", "Q4", or "Quarter 1-4", or dates like "March 31" (Q1), "June 30" (Q2), "September 30" (Q3), "December 31" (Q4)
3. Year: Extract from quarter date or report date
4. **Capital Commitments (Fund Size)**: Look in the notes section or fund information for "Capital Commitments", "Fund Size", "Total Commitments", "Committed Capital". This is usually in end-of-year reports. Return 0 if not found.
5. **Management Fees**: Look for "Management Fees", "Management Fee", "Advisory Fees" in expenses section. Return this quarter's amount only (not cumulative). If not explicitly found, identify the largest line item in operating expenses and assume that's the management fee. Return 0 if no expenses found.
6. **Operating Costs**: Look for "Operating Expenses", "Operating Costs", "Fund Expenses", "Administrative Expenses". Return this quarter's amount only. Return 0 if not found.
7. **Formation Costs**: Look for "Formation Costs", "Formation Expenses", "Organizational Costs", "Setup Costs". These are typically one-time costs. Return 0 if not found.
8. For each investment, extract:
   - Company name (clean, no extra symbols)
   - Investment date in YYYY-MM-DD format (or null)
   - Cost/Initial Investment (numeric only, no currency symbols)
   - Current Value/Fair Value (numeric only, no currency symbols)
9. Only include actual portfolio companies, not totals or subtotals
10. All financial numbers should be numeric only, no currency symbols or commas
11. Return valid JSON only`
      }]
    });

    const responseText = message.content[0].text.trim();

    // Try to extract JSON if Claude wrapped it in markdown
    let jsonText = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    const data = JSON.parse(jsonText);

    // Validate the structure
    if (!data.investments || !Array.isArray(data.investments)) {
      throw new Error('Invalid response structure from Claude');
    }

    return {
      success: true,
      fundName: data.fundName || null,
      year: data.year || null,
      quarter: data.quarter || null,
      capital_commitments: parseFloat(data.capital_commitments) || 0,
      management_fees: parseFloat(data.management_fees) || 0,
      operating_costs: parseFloat(data.operating_costs) || 0,
      formation_costs: parseFloat(data.formation_costs) || 0,
      investments: data.investments.map(inv => ({
        company_name: inv.company_name,
        investment_date: inv.investment_date,
        cost: parseFloat(inv.cost) || 0,
        current_value: parseFloat(inv.current_value) || 0
      })),
      count: data.investments.length
    };

  } catch (error) {
    console.error('Claude extraction error:', error);
    return {
      success: false,
      error: error.message,
      fundName: null,
      year: null,
      quarter: null,
      capital_commitments: 0,
      management_fees: 0,
      operating_costs: 0,
      formation_costs: 0,
      investments: [],
      count: 0
    };
  }
}

module.exports = {
  extractWithClaude
};
