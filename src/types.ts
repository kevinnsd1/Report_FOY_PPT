export interface ReportRow {
    date: string;
    publication: string;
    title: string;
    link: string;
    summary: string | string[]; // Support plain text or array (will be bulleted)
    sentiment: string;
    remarks: string;
}

// Base Slide Interface
export interface BaseSlide {
    type: 'table' | 'text' | 'title';
    sectionTitle?: string;
}

// Table Slide Interface
export interface TableSlide extends BaseSlide {
    type: 'table';
    tableTitle?: string;
    rows: ReportRow[];
}

// Text Slide Interface (New)
export interface TextSlide extends BaseSlide {
    type: 'text';
    title?: string;
    content: string;
}

// Union Type for Slides
export type ReportSlide = TableSlide | TextSlide;

export interface ReportMeta {
    title?: string;
    footerTitle?: string;
    footerAddress?: string;
    logo?: string;
}

export interface ReportData {
    meta?: ReportMeta;
    slides: ReportSlide[]; // Array of slides
}
