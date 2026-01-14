const { PDFParse } = require('pdf-parse');
const fs = require('fs');

async function extractTextFromPDF(pdfPath) {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);

    // Create parser instance with data buffer
    const parser = new PDFParse({ data: dataBuffer });

    // Extract text
    const result = await parser.getText();

    // Get document info
    const info = await parser.getInfo();

    return {
      success: true,
      text: result.text,
      pages: result.pages?.length || 0,
      info: info
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function cleanText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\t+/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .trim();
}

module.exports = {
  extractTextFromPDF,
  cleanText
};
