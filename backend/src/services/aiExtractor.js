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
      model: 'claude-3-sonnet-20240229',
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
4. For each investment, extract:
   - Company name (clean, no extra symbols)
   - Investment date in YYYY-MM-DD format (or null)
   - Cost/Initial Investment (numeric only, no currency symbols)
   - Current Value/Fair Value (numeric only, no currency symbols)
5. Only include actual portfolio companies, not totals or subtotals
6. Return valid JSON only`
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
      investments: [],
      count: 0
    };
  }
}

module.exports = {
  extractWithClaude
};
