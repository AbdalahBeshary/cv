const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/export-pdf', async (req, res) => {
  const { url, sections, styleConfig } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    
    // Inject the hydration data BEFORE the navigation starts
    if (sections && styleConfig) {
      await page.evaluateOnNewDocument((data) => {
        window.CV_HYDRATION_DATA = data;
      }, { sections, styleConfig });
    }

    // Emulate print media to ensure CSS @media print rules apply
    await page.emulateMediaType('print');
    
    // We wait for DOM content to ensure fonts + layout engine are ready
    await page.goto(url, { waitUntil: ['networkidle0', 'domcontentloaded'] });
    
    // Wait for the frontend LayoutEngine to signal that measurement and pagination is finished
    await page.waitForFunction('window.RENDER_COMPLETE === true', { timeout: 10000 });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      }
    });

    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': 'attachment; filename=cv.pdf'
    });
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
