import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

/**
 * Shared CSS styles used by both YouTube and Instagram PDF templates.
 * Extracted to avoid duplication across individual page template files.
 */
const getSharedStyles = (): string => `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');

* {
    box-sizing: border-box;
}
body {
    font-family: 'Outfit', sans-serif;
    margin: 0;
    padding: 0;
    color: #0f172a;
    background-color: #f8fafc;
    -webkit-print-color-adjust: exact;
}
.page {
    width: 210mm;
    height: 297mm;
    padding: 25mm 20mm;
    margin: 0 auto;
    background: #ffffff;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 0 20px rgba(0,0,0,0.05);
}
.page-break {
    page-break-after: always;
    break-after: page;
}

/* Typography details */
h1, h2, h3 {
    margin: 0;
    color: #1e1b4b;
}
.gradient-text {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* Page Header component */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #f1f5f9;
    padding-bottom: 15px;
    margin-bottom: 30px;
}
.page-header .brand {
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #4f46e5;
}
.page-header .page-num {
    font-size: 12px;
    color: #94a3b8;
    font-weight: 600;
}

/* Page Footer component */
.page-footer {
    border-top: 1px solid #e2e8f0;
    padding-top: 15px;
    margin-top: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: #64748b;
}

/* PAGE 1: EXECUTIVE SUMMARY STYLES */
.hero {
    text-align: center;
    margin: 40px 0;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.avatar {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    border: 4px solid #e2e8f0;
    box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.15);
    margin-bottom: 20px;
    object-fit: cover;
}
.hero h1 {
    font-size: 38px;
    font-weight: 800;
    letter-spacing: -1px;
    margin-bottom: 10px;
}
.hero p {
    color: #64748b;
    font-size: 18px;
    margin: 0 0 35px 0;
}
.stats-row {
    display: flex;
    justify-content: space-between;
    width: 100%;
    max-width: 500px;
    margin-bottom: 45px;
    gap: 15px;
}
.stat-item {
    flex: 1;
    padding: 16px;
    background: #fafafa;
    border: 1px solid #f1f5f9;
    border-radius: 16px;
    text-align: center;
}
.stat-val {
    font-size: 22px;
    font-weight: 800;
    color: #4f46e5;
}
.stat-lbl {
    font-size: 11px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 4px;
    font-weight: 600;
}
.fee-card {
    background: linear-gradient(135deg, #1e1b4b 0%, #311042 100%);
    color: #ffffff;
    width: 100%;
    padding: 25px;
    border-radius: 20px;
    box-shadow: 0 20px 40px -15px rgba(30, 27, 75, 0.25);
    text-align: center;
    border: 1px solid rgba(255,255,255,0.05);
}
.fee-card .lbl {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #a5b4fc;
    font-weight: 600;
    margin-bottom: 8px;
}
.fee-card .val {
    font-size: 42px;
    font-weight: 800;
    color: #ffffff;
}

/* PAGE 2: ALIGNMENT STYLES */
.content-body {
    flex-grow: 1;
}
.section-title {
    font-size: 24px;
    font-weight: 800;
    margin-bottom: 20px;
    border-left: 4px solid #4f46e5;
    padding-left: 12px;
}
.intro-text {
    font-size: 15px;
    line-height: 1.7;
    color: #475569;
    margin-bottom: 30px;
}
.highlight-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 25px;
    margin-bottom: 30px;
}
.highlight-box h4 {
    margin: 0 0 10px 0;
    font-size: 16px;
    font-weight: 600;
    color: #1e1b4b;
}
.highlight-box p {
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
    color: #64748b;
}
.bullets {
    margin-top: 25px;
}
.bullet-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 18px;
}
.bullet-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4f46e5;
    margin-top: 6px;
    margin-right: 12px;
    flex-shrink: 0;
}
.bullet-content {
    font-size: 14px;
    line-height: 1.5;
    color: #334155;
}
.bullet-content strong {
    color: #1e1b4b;
}

/* PAGE 3: ROI STYLES */
.roi-table {
    width: 100%;
    border-collapse: collapse;
    margin: 30px 0;
}
.roi-table th {
    text-align: left;
    padding: 16px 20px;
    background: #f1f5f9;
    color: #1e1b4b;
    font-weight: 600;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #e2e8f0;
}
.roi-table td {
    padding: 18px 20px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 14px;
    color: #334155;
}
.roi-table tr:last-child td {
    border-bottom: none;
    font-weight: 800;
    background: #fafafa;
}
.formula-box {
    background: #eef2ff;
    border: 1px dashed #c7d2fe;
    border-radius: 16px;
    padding: 20px;
    text-align: center;
    font-size: 13px;
    color: #3730a3;
    font-family: monospace;
    margin-top: 30px;
}

/* YOU VS INDUSTRY BENCHMARK SECTION */
.benchmark-section {
  margin: 24px 0;
  padding: 20px;
  background: #f8f8ff;
  border-radius: 8px;
  border-left: 4px solid #3d3580;
}
.benchmark-title {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 4px;
  margin-top: 0;
}
.benchmark-subtitle {
  font-size: 11px;
  color: #666;
  margin-bottom: 16px;
  margin-top: 0;
}
.benchmark-bar-container {
  display: flex;
  align-items: center;
  gap: 10px;
}
.benchmark-track {
  position: relative;
  flex: 1;
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  overflow: visible;
}
.benchmark-fill {
  height: 100%;
  background: linear-gradient(90deg, #3d3580, #6c63ff);
  border-radius: 6px;
}
.benchmark-marker {
  position: absolute;
  top: -24px;
  transform: translateX(-50%);
  background: #3d3580;
  color: white;
  font-size: 9px;
  font-weight: 700;
  padding: 3px 6px;
  border-radius: 4px;
  white-space: nowrap;
}
.benchmark-marker-label {
  color: white;
}
.benchmark-low, .benchmark-high {
  font-size: 10px;
  color: #888;
  white-space: nowrap;
}
.benchmark-note {
  font-size: 9px;
  color: #aaa;
  margin-top: 10px;
  margin-bottom: 0;
  font-style: italic;
}

/* 3-TIER PACKAGE TABLE */
.tier-section { margin: 20px 0; }
.tier-title {
  font-size: 13px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 10px;
  margin-top: 0;
}
.tier-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}
.tier-table thead tr {
  background: #1a1a2e;
  color: white;
}
.tier-table th {
  padding: 8px 12px;
  text-align: left;
  font-weight: 600;
  color: white;
}
.tier-table td { padding: 8px 12px; border-bottom: 1px solid #eee; }
.tier-highlighted { background: #f0eeff; }
.tier-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 9px;
  font-weight: 700;
}
.tier-badge.starter { background: #e8e8e8; color: #555; }
.tier-badge.standard { background: #3d3580; color: white; }
.tier-badge.premium { background: #1a1a2e; color: #f0c040; }
.tier-price { font-weight: 700; color: #3d3580; }
.tier-price.highlighted { font-size: 13px; color: #1a1a2e; }
.tier-note {
  font-size: 9px;
  color: #aaa;
  font-style: italic;
  margin-top: 6px;
  margin-bottom: 0;
}

/* PAGE 4 NEGOTIATION PLAYBOOK */
.neg-block {
  margin: 14px 0;
  padding: 14px 16px;
  border-radius: 8px;
}
.neg-block.floor {
  background: #fff3f3;
  border-left: 4px solid #e53935;
}
.neg-block.counter {
  background: #f3f8ff;
  border-left: 4px solid #1976d2;
}
.neg-block.extras {
  background: #f3fff6;
  border-left: 4px solid #2e7d32;
}
.neg-block.redflags {
  background: #fff8e1;
  border-left: 4px solid #f57f17;
}
.neg-block-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  color: #333;
}
.neg-block-value {
  font-size: 28px;
  font-weight: 800;
  color: #e53935;
  margin: 4px 0 8px;
}
.neg-block-desc {
  font-size: 10px;
  color: #555;
  line-height: 1.5;
  margin: 0;
}
.neg-script {
  font-size: 11px;
  color: #1a1a2e;
  line-height: 1.6;
  font-style: italic;
  background: white;
  padding: 10px;
  border-radius: 6px;
  margin-top: 8px;
}
.neg-list {
  font-size: 10px;
  color: #333;
  line-height: 1.8;
  padding-left: 16px;
  margin: 8px 0 0;
}
.neg-list li { margin-bottom: 4px; }
.neg-list.red li { color: #b71c1c; }

/* PAGE 5 OUTREACH EMAIL TEMPLATE */
.email-container {
  border: 1.5px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  margin: 16px 0;
  font-size: 11px;
}
.email-meta {
  background: #f5f5f5;
  padding: 12px 16px;
  border-bottom: 1px solid #ddd;
}
.email-meta-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 6px;
}
.email-meta-label {
  font-weight: 700;
  color: #555;
  font-size: 10px;
  min-width: 55px;
  padding-top: 1px;
}
.email-meta-value {
  color: #333;
  line-height: 1.4;
}
.email-meta-value.subject {
  font-weight: 600;
  color: #1a1a2e;
}
.email-body {
  padding: 16px;
  color: #1a1a2e;
  line-height: 1.7;
  background: white;
}
.email-body p {
  margin-bottom: 12px;
  margin-top: 0;
}
.email-body p:last-child {
  margin-bottom: 0;
}
.email-tip {
  margin: 12px 0;
  padding: 10px 14px;
  background: #fffbe6;
  border-left: 3px solid #f59e0b;
  font-size: 10px;
  color: #555;
  border-radius: 4px;
  line-height: 1.5;
}
`;

/**
 * Generates a Media Kit PDF by loading platform-specific templates.
 * @param data Template data object
 * @param platform 'youtube' or 'instagram' — determines which template set to load
 */
export const generateMediaKit = async (data: any, platform: string = 'youtube'): Promise<Buffer> => {
  try {
    const templateDir = path.resolve(__dirname, `../templates/${platform}`);
    const pageFiles = ['cover.hbs', 'alignment.hbs', 'roi.hbs', 'negotiation.hbs', 'outreach.hbs'];

    // Read and compile each page template
    const compiledPages: string[] = [];
    for (const file of pageFiles) {
      const filePath = path.join(templateDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const template = handlebars.compile(content);
      compiledPages.push(template(data));
    }

    // Assemble full HTML document with shared styles
    const htmlString = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Sponsorship Proposal - ${data.channelName || 'Creator'}</title>
    <style>${getSharedStyles()}</style>
</head>
<body>
${compiledPages.join('\n<div class="page-break"></div>\n')}
</body>
</html>`;

    // Call Api2Pdf
    const pdfResponse = await axios.post(
      'https://v2.api2pdf.com/chrome/html',
      { html: htmlString, inline: true },
      {
        headers: {
          'Authorization': process.env.API2PDF_KEY || '',
          'Content-Type': 'application/json',
        },
      }
    );

    const fileUrl = pdfResponse.data?.pdf || pdfResponse.data?.FileUrl;
    if (!fileUrl) {
      throw new Error('No FileUrl returned from Api2Pdf');
    }

    // Fetch the actual PDF buffer
    const bufferResponse = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
    });

    return Buffer.from(bufferResponse.data);
  } catch (error: any) {
    console.error('PDF Generation Error:', error.response?.data || error.message);
    throw new Error('External PDF rendering failed.');
  }
};
