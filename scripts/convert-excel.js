const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..');
const destDir = path.join(__dirname, '..', 'data');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function convert(file, sheetName, outputFile, columns, transform) {
  const filePath = path.join(rootDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }
  const workbook = xlsx.readFile(filePath, { cellDates: true });
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    console.error(`Sheet not found: ${sheetName} in ${file}`);
    return;
  }
  let data = xlsx.utils.sheet_to_json(sheet);
  
  if (columns) {
    data = data.map(row => {
      const newRow = {};
      columns.forEach(col => {
        newRow[col] = row[col] !== undefined ? row[col] : null;
      });
      return newRow;
    });
  }
  
  if (transform) {
    data = transform(data);
  }

  const outPath = path.join(destDir, outputFile);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log(`Created ${outPath}`);
}

// 1. Library_MockData.xlsx
convert(
  'Library_MockData.xlsx',
  'Library Books',
  'library.json',
  ['Book ID', 'Title', 'Author', 'Category', 'ISBN', 'Total Copies', 'Available Copies', 'Location/Shelf', 'Edition', 'Year Published', 'Status']
);

// 2. Cafeteria_MockData.xlsx
convert(
  'Cafeteria_MockData.xlsx',
  'Cafeteria Menu',
  'cafeteria.json',
  ['Menu ID', 'Day', 'Meal Type', 'Item Name', 'Description', 'Cuisine Type', 'Is Veg', 'Price (₹)', 'Calories (kcal)', 'Allergens', 'Available From', 'Available Until', 'Special Diet']
);

// 3. IITR_Events_Complete.xlsx
convert(
  'IITR_Events_Complete.xlsx',
  'Campus Events',
  'events.json',
  ['Event ID', 'Event Name', 'Organizing Club', 'Category', 'Date', 'Start Time', 'Venue', 'Description']
);

// 4. IITR_Academics_Complete.xlsx -> courses.json
convert(
  'IITR_Academics_Complete.xlsx',
  'Courses',
  'courses.json',
  ['Branch', 'Semester', 'Course Code', 'Course Name', 'Faculty', 'Credits']
);

// 4. IITR_Academics_Complete.xlsx -> branches.json
convert(
  'IITR_Academics_Complete.xlsx',
  'Branches',
  'branches.json',
  null,
  (data) => data.map(row => row['Branch'] || row['Branch Name'] || Object.values(row)[0])
);
