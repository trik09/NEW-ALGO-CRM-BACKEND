
import xlsx from "xlsx";
import path from "path";
import fs from "fs";

const filePath = path.join(process.cwd(), "utils", "ALGOCUSTOMERS.xlsx");
const outputPath = path.join(process.cwd(), "utils", "rows_dump.json");

try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Read first 10 rows
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, range: 0, defval: "" }).slice(0, 10);

    fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2));
    console.log("Rows written to rows_dump.json");

} catch (err) {
    fs.writeFileSync(outputPath, JSON.stringify({ error: err.message }));
}
