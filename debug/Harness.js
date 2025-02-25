const libParseCSV = require('../utility/csvparser/ParseCSV-Program.js');

// This command takes the `TabularManifestCSV.csv` file and imports it into a JSON file
//libParseCSV.run(['node', 'Harness.js', 'import']);
// This command takes the `data/MathExampleForm.json` file and injects any sidecare files in the `input_data` folder into the JSON file
//libParseCSV.run(['node', 'Harness.js', 'inject']);
libParseCSV.run(['node', 'Harness.js', 'intersect']);