// const libParseCSV = require('../utility/csvparser/ParseCSV-Program.js');

// This command takes the `TabularManifestCSV.csv` file and imports it into a JSON file
//libParseCSV.run(['node', 'Harness.js', 'import']);
// This command takes the `data/MathExampleForm.json` file and injects any sidecare files in the `input_data` folder into the JSON file
//libParseCSV.run(['node', 'Harness.js', 'inject']);
//libParseCSV.run(['node', 'Harness.js', 'intersect']);
//libParseCSV.run(['node', 'Harness.js', 'converttocsv', 'data/MathExampleForm.json', '-o', 'data/MathExampleForm-Reconstituted.csv', '-d', 'data/']);

const libStep1 = require('./Step-1-GenerateJSON.js');

// const libStep2 = require('./Step-2-InjectContent.js');

// const libStep3 = require('./Step-3-BuildDistilling.js');

// const libStep4 = require('./Step-4-ConvertToCSV.js');
