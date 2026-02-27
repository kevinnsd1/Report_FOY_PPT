import { generatePPT } from './generator';
import * as path from 'path';
import * as fs from 'fs';

// This is a local testing script. The actual API server is in server.ts.
const main = async () => {
    console.log("To generate a report via API, please run 'npm run dev' and POST to /generateReporting.");
    console.log("This index.ts file is reserved for local, non-server script execution if needed.");

    // Example of how you could read a local JSON payload instead of mock data:
    // const payloadPath = path.resolve(__dirname, '../payload.json');
    // if (fs.existsSync(payloadPath)) {
    //     const data = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
    //     const outputPath = path.resolve(__dirname, '../report.pptx');
    //     const pptBuffer = await generatePPT(data);
    //     fs.writeFileSync(outputPath, pptBuffer);
    //     console.log(`Generated report from local payload to ${outputPath}`);
    // } else {
    //     console.log("No payload.json found. Exiting local script.");
    // }
};

main();
