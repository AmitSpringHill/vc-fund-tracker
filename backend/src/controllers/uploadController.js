const Quarter = require('../models/quarter');
const Fund = require('../models/fund');
const { extractTextFromPDF, cleanText } = require('../services/pdfParser');
const { getQuarterEndDate } = require('../services/dataExtractor');
const { extractWithClaude } = require('../services/aiExtractor');
const path = require('path');

async function analyzePDF(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No PDF file uploaded'
      });
    }

    const pdfPath = req.file.path;
    const pdfFilename = req.file.filename;

    // Extract text from PDF
    const extractionResult = await extractTextFromPDF(pdfPath);

    if (!extractionResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to extract text from PDF',
        details: extractionResult.error
      });
    }

    const cleanedText = cleanText(extractionResult.text);

    // Use Claude AI to extract structured data
    const aiResult = await extractWithClaude(cleanedText);

    if (!aiResult.success) {
      return res.status(500).json({
        success: false,
        error: aiResult.error || 'Failed to extract data with AI',
        detectedMetadata: {
          fundName: null,
          year: null,
          quarter: null,
          detected: false
        },
        extractedInvestments: [],
        extractionSuccess: false,
        investmentCount: 0
      });
    }

    res.status(200).json({
      success: true,
      pdfPath: pdfPath,
      pdfFilename: pdfFilename,
      detectedMetadata: {
        fundName: aiResult.fundName,
        year: aiResult.year,
        quarter: aiResult.quarter,
        detected: !!(aiResult.fundName && aiResult.year && aiResult.quarter)
      },
      extractedInvestments: aiResult.investments,
      extractionSuccess: aiResult.success,
      investmentCount: aiResult.count,
      message: aiResult.fundName && aiResult.year && aiResult.quarter
        ? `Auto-detected: ${aiResult.fundName}, Q${aiResult.quarter} ${aiResult.year}`
        : 'Data extracted. Please review and enter fund/quarter details.'
    });

  } catch (error) {
    console.error('PDF analysis error:', error);
    next(error);
  }
}

async function uploadPDF(req, res, next) {
  try {
    const { fund_id, fund_name, year, quarter, pdf_path, pdf_filename, create_fund } = req.body;

    if (!year || !quarter) {
      return res.status(400).json({
        success: false,
        error: 'Year and quarter are required'
      });
    }

    const yearNum = parseInt(year);
    const quarterNum = parseInt(quarter);

    if (quarterNum < 1 || quarterNum > 4) {
      return res.status(400).json({
        success: false,
        error: 'Quarter must be between 1 and 4'
      });
    }

    let fundId = fund_id ? parseInt(fund_id) : null;

    // Create fund if needed
    if (!fundId && create_fund && fund_name) {
      const existingFund = Fund.getAll().find(f => f.name.toLowerCase() === fund_name.toLowerCase());

      if (existingFund) {
        fundId = existingFund.id;
      } else {
        const newFund = Fund.create(fund_name, `Created from PDF upload on ${new Date().toISOString().split('T')[0]}`);
        fundId = newFund.id;
      }
    }

    if (!fundId) {
      return res.status(400).json({
        success: false,
        error: 'Fund ID or fund name is required'
      });
    }

    // Check if quarter already exists
    const existing = Quarter.exists(fundId, yearNum, quarterNum);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `Quarter ${quarterNum} of ${yearNum} already exists for this fund`,
        existingQuarterId: existing.id
      });
    }

    const quarterDate = getQuarterEndDate(yearNum, quarterNum);

    const newQuarter = Quarter.create(fundId, yearNum, quarterNum, quarterDate, pdf_filename, pdf_path);

    res.status(200).json({
      success: true,
      quarter: newQuarter,
      fundId: fundId,
      message: 'Quarter created successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    next(error);
  }
}

module.exports = {
  analyzePDF,
  uploadPDF
};
