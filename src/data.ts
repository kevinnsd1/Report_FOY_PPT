import { ReportRow } from './types';

export const mockData: ReportRow[] = [
    {
        date: '5 Jan 2026',
        publication: 'Nanyang Siang Pau',
        title: '5 major positive support for the Malaysian industry to sing well this year | e South Seas',
        link: 'https://example.com/article1',
        summary: 'This year will be a key delivery year for major infrastructure projects, which is expected to further consolidate the position of urban development as an economic priority and support the industrial market.\nThese projects include: the Shah Alam Light Rapid Transit Line (LRT3), which is expected to be completed in the second quarter of this year',
        sentiment: 'Neutral',
        remarks: 'By stating Q2 2026 as the targeted completion date, a public expectation is established. Any delays beyond this timeline may invite increased public and media scrutiny.'
    },
    {
        date: '5 Jan 2026',
        publication: 'New Straits Times',
        title: 'INDUSTRY EXPERTS POSITIVE ABOUT PROPERTY MARKET',
        link: 'https://example.com/article2',
        summary: '2026 will be a critical delivery year for major infrastructure projects. These include the Light Rail Transit Shah Alam Line (LRT3), expected to be completed by the second quarter of 2026',
        sentiment: 'Neutral',
        remarks: 'Any delays beyond this timeline may invite increased public and media scrutiny.'
    },
    {
        date: '5 Jan 2026',
        publication: 'Star Property News',
        title: 'Savills Malaysia’s top predictions for 2026',
        link: 'https://example.com/article3',
        summary: 'Urban development remains at the forefront of economic strategy, with 2026 serving as a critical delivery year for major transport projects:\nLRT Shah Alam Line (LRT3): Connecting Bandar Utama to Klang is expected to be completed by Q2 2026.',
        sentiment: 'Neutral',
        remarks: ''
    }
];

export const getLargeMockData = (count: number): ReportRow[] => {
    const data: ReportRow[] = [];
    for (let i = 0; i < count; i++) {
        const original = mockData[i % mockData.length];
        data.push({ ...original, title: `${original.title} (${i + 1})` });
    }
    return data;
};

