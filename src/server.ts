import express from 'express';
import cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { generatePPT } from './generator';
import { getLargeMockData } from './data';
import { ReportRow } from './types';

import multer from 'multer';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.use(cors());
app.use(express.json());
app.use('/download', express.static(path.join(__dirname, '../public')));

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../public/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'logo-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage: storage });

// Health Check
app.get('/', (req, res) => {
    res.send('PPT Generator API is running');
});

// Upload Logo Endpoint
app.post('/upload-logo', upload.single('logo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Use environment BASE_URL if defined, otherwise derive from request context
    const dynamicBaseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${dynamicBaseUrl}/download/uploads/${req.file.filename}`;

    res.json({
        message: 'Logo uploaded successfully',
        url: fileUrl,
        filename: req.file.filename
    });
});

// Generate PPT
app.post('/generateReporting', async (req, res) => {
    try {
        const body = req.body;

        // Construct ReportData object found in body
        // If body has slides, use it. If not, fallback or transform old structure?
        // Let's assume new structure is sent or we transform it.
        // For backward compatibility, let's check if 'rows' exists and 'slides' doesn't.

        let reportData: any = {};

        if (body.slides) {
            // New Structure
            reportData = body;
        } else if (body.rows) {
            // BACKWARD COMPATIBILITY: Transform old structure to new structure
            reportData = {
                meta: {
                    title: body.title,
                    sectionTitle: body.sectionTitle,
                    tableTitle: body.tableTitle,
                    footerTitle: body.footerTitle,
                    footerAddress: body.footerAddress,
                    logo: body.logo
                },
                slides: [
                    {
                        type: 'table',
                        sectionTitle: body.sectionTitle,
                        tableTitle: body.tableTitle,
                        rows: body.rows
                    }
                ]
            };
        } else {
            // No Data Provided - Return Error
            return res.status(400).json({ error: 'No data provided. Please send either "slides" or "rows".' });
        }

        console.log(`Generating PPT with ${reportData.slides?.length} slides...`);

        const pptBuffer = await generatePPT(reportData);

        // Generate unique filename
        const timestamp = new Date().getTime();
        const filename = `report-${timestamp}.pptx`;
        const savePath = path.join(__dirname, '../public', filename);

        // Ensure public dir exists
        if (!fs.existsSync(path.dirname(savePath))) {
            fs.mkdirSync(path.dirname(savePath), { recursive: true });
        }

        // Save file locally
        fs.writeFileSync(savePath, pptBuffer);

        console.log(`PPT saved to ${savePath}`);

        // Use environment BASE_URL if defined, otherwise derive from request context
        const dynamicBaseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

        // Return JSON Response
        res.json({
            message: "Generate berhasil",
            filename: filename,
            downloadUrl: `${dynamicBaseUrl}/download/${filename}`
        });

    } catch (error) {
        console.error("Error generating PPT:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
