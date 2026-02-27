import PptxGenJS from 'pptxgenjs';
import { ReportRow, ReportMeta, ReportData } from './types';

// Constants for styling
const COLORS = {
    headerBg: '002060', // Dark Blue
    headerText: 'FFFFFF', // White
    rowBgOdd: 'FFFFFF', // White
    rowBgEven: 'DDEBF7', // Light Blue
    border: '002060',   // Dark Blue Border
    text: '000000',
    titleRed: 'C0504D'
};

export const generatePPT = async (data: ReportData): Promise<Buffer> => {
    const pres = new PptxGenJS();

    // Define Layout
    pres.layout = 'LAYOUT_16x9';

    // Defaults - Left empty if not provided in payload
    const mainTitle = data.meta?.title || "";
    const footerTitle = data.meta?.footerTitle || "";
    const footerAddress = data.meta?.footerAddress || "";

    // Helper to fetch image and convert to base64
    const getBase64FromUrl = async (url: string): Promise<string | null> => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            return `data:image/png;base64,${buffer.toString('base64')}`;
        } catch (error) {
            console.warn(`Failed to load remote logo from ${url}:`, error);
            return null;
        }
    };

    const baseSlideObjects: any[] = [
        // Title Placeholders (Will be overridden per slide if needed, but keeping for consistency)
        // Footer - Title (BLUE as requested)
        { text: { text: footerTitle, options: { x: 0.5, y: 5.3, w: '90%', fontSize: 9, bold: true, color: COLORS.border } } },
        // Footer - Address (BLUE as requested)
        { text: { text: footerAddress, options: { x: 0.5, y: 5.45, w: '90%', fontSize: 8, color: COLORS.border } } }
    ];

    // 1. Logic for Logo vs Text
    let logoPath = null;
    if (data.meta?.logo) {
        if (data.meta.logo.startsWith('http')) {
            // It's a URL, try to pre-fetch it to avoid crashing if network is down
            logoPath = await getBase64FromUrl(data.meta.logo);
        } else {
            // Local path or already base64
            logoPath = data.meta.logo;
        }
    }

    if (logoPath) {
        // Prepare Image Options
        const imgOpts: any = {
            x: 0.3,
            y: 0.15, // Raised up as requested
            w: 1.5,
            h: 1, // Increased height slightly to prevent too much squashing if logo is square-ish
            sizing: { type: 'contain' } // Remove internal w/h to rely on outer box
        };

        // Determine if it's path or data (Base64)
        if (logoPath.startsWith('data:')) {
            imgOpts.data = logoPath; // Use 'data' for Base64
        } else {
            imgOpts.path = logoPath; // Use 'path' for Local Files
        }

        // Add as image
        baseSlideObjects.push({ image: imgOpts });
    } else {
        // Fallback to NO TEXT if logo fails or is missing (as per user request)
        if (data.meta?.logo) console.warn('Logo defined but failed to load, and fallback text is disabled.');
    }

    // ---------------------------------------------------------
    // GENERATE SLIDES BASED ON ARRAY
    // ---------------------------------------------------------

    if (data.slides) {
        data.slides.forEach((slideData, index) => {
            // Create a UNIQUE Master for this section to ensure Section Title repeats on auto-paginated slides
            const masterName = `MASTER_SECTION_${index}`;

            // Clone base objects
            const sectionSlideObjects = [...baseSlideObjects];

            // Add Main Title to Master (so it repeats)
            sectionSlideObjects.push({
                text: { text: mainTitle, options: { x: 0, y: 0.4, w: '100%', align: 'center', fontSize: 16, bold: true, color: '000000' } }
            });

            // Add Section Title to Master (so it repeats)
            if (slideData.sectionTitle) {
                sectionSlideObjects.push({
                    text: { text: slideData.sectionTitle, options: { x: 0, y: 0.9, w: '100%', align: 'center', fontSize: 14, bold: true, color: '000000' } }
                });
            }

            // Define this specific master
            pres.defineSlideMaster({
                title: masterName,
                background: { color: 'FFFFFF' },
                margin: [0.5, 0.25, 1.75, 0.25], // Use 1.75 to be EXTREMELY safe from footer
                objects: sectionSlideObjects
            });

            // Create a new slide using this Section Master
            const slide = pres.addSlide({ masterName: masterName });

            // --- TYPE: TABLE ---
            if (slideData.type === 'table') {
                const tableTitle = slideData.tableTitle || "";
                const rows: any[] = [];

                slideData.rows.forEach((row, rIndex) => {
                    const rowFill = rIndex % 2 === 0 ? COLORS.rowBgOdd : COLORS.rowBgEven;

                    // Native PPT Bullets with breakLine
                    const summaryCell = {
                        text: Array.isArray(row.summary)
                            ? row.summary.map((point: string) => ({ text: point, options: { bullet: true, breakLine: true } }))
                            : [{ text: row.summary, options: { bullet: true } }],
                        options: { fill: rowFill, align: 'left', valign: 'top', fontSize: 10 }
                    };

                    rows.push([
                        { text: row.date, options: { fill: rowFill, align: 'center', valign: 'middle', fontSize: 10 } },
                        { text: row.publication, options: { fill: rowFill, align: 'center', valign: 'middle', fontSize: 10 } },
                        { text: row.title, options: { fill: rowFill, align: 'left', valign: 'top', fontSize: 10, hyperlink: { url: row.link } } },
                        summaryCell,
                        { text: row.sentiment, options: { fill: rowFill, align: 'center', valign: 'middle', fontSize: 9 } },
                        { text: row.remarks, options: { fill: rowFill, align: 'center', valign: 'middle', fontSize: 10 } }
                    ]);
                });

                // Column Widths
                const colWidths = [0.8, 1.0, 1.8, 3.4, 0.8, 1.6];

                // Table Headers
                const superHeader = [
                    {
                        text: tableTitle,
                        options: {
                            fill: 'D9D9D9',
                            color: '000000',
                            bold: true,
                            align: 'center',
                            colspan: 6
                        }
                    }
                ];

                const customHeaders = [
                    superHeader,
                    [
                        { text: "Date", options: { fill: COLORS.headerBg, color: COLORS.headerText, bold: true, align: 'center' } },
                        { text: "Publication", options: { fill: COLORS.headerBg, color: COLORS.headerText, bold: true, align: 'center' } },
                        { text: "Title and Link", options: { fill: COLORS.headerBg, color: COLORS.headerText, bold: true, align: 'center' } },
                        { text: "Summary / Key Points", options: { fill: COLORS.headerBg, color: COLORS.headerText, bold: true, align: 'center' } },
                        { text: "Sentiment", options: { fill: COLORS.headerBg, color: COLORS.headerText, bold: true, align: 'center', fontSize: 9 } },
                        { text: "Remarks", options: { fill: COLORS.headerBg, color: COLORS.headerText, bold: true, align: 'center' } }
                    ]
                ];

                // Add Table with Auto-Pagination
                // @ts-ignore
                slide.addTable([...customHeaders, ...rows], {
                    x: 0.25,
                    y: 1.3,
                    w: 9.5,
                    colW: colWidths,
                    border: { pt: 1, color: COLORS.border },
                    autoPage: true, // Enable Auto Pagination
                    autoPageRepeatHeader: true, // Auto Repeat Headers
                    autoPageHeaderRows: 2, // Repeat both "News" and "Date/Publication" rows
                    autoPageSlideStartY: 1.3, // Start Y for new slides
                    // @ts-ignore - These properties ensure consistent layout on auto-generated pages
                    newSlideStartY: 1.3,
                    autoPageLineWeight: 0,
                    autoPageCharWeight: 0,
                    master: masterName // CRITICAL: This ensures new slides use the Specific Section Master
                } as any);

            }

            // --- TYPE: TEXT (NEW) ---
            else if (slideData.type === 'text') {
                // Add Title if exists specific for text slide
                if (slideData.title) {
                    slide.addText(slideData.title, { x: 0.5, y: 1.4, w: 9, fontSize: 12, bold: true, color: COLORS.headerBg });
                }
                // Add Content Content
                slide.addText(slideData.content, {
                    x: 0.5,
                    y: slideData.title ? 1.8 : 1.4,
                    w: 9,
                    h: 3.5, // Adjusted to 3.5 to avoid footer overlap (4.0 was too large)
                    fontSize: 11,
                    color: '000000',
                    align: 'justify',
                    valign: 'top'
                });
            }
        });
    }

    return await pres.write({ outputType: 'nodebuffer' }) as unknown as Promise<Buffer>;
};
