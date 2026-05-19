"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMediaKit = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const handlebars_1 = __importDefault(require("handlebars"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const generateMediaKit = async (data) => {
    let browser = null;
    try {
        // Read and compile the Handlebars template
        const templatePath = path_1.default.resolve(__dirname, '../templates/media-kit.hbs');
        const templateContent = await promises_1.default.readFile(templatePath, 'utf-8');
        const template = handlebars_1.default.compile(templateContent);
        const htmlContent = template(data);
        // Launch headless Puppeteer instance with critical memory sandbox configs
        browser = await puppeteer_1.default.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'load' });
        // Generate PDF buffer
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
        });
        return Buffer.from(pdfBuffer);
    }
    catch (error) {
        throw new Error(`Failed to generate PDF: ${error.message}`);
    }
    finally {
        // Critical Memory Sandbox: Ensure browser is closed even on errors
        if (browser) {
            await browser.close();
        }
    }
};
exports.generateMediaKit = generateMediaKit;
