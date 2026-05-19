import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

export const generateMediaKit = async (data: any): Promise<Buffer> => {
  try {
    // Read and compile the Handlebars template
    const templatePath = path.resolve(__dirname, '../templates/media-kit.hbs');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent);
    const htmlString = template(data);

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
