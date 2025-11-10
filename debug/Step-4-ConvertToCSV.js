const libParseCSV = require('../utility/csvparser/ParseCSV-Program.js');
// This command takes the `data/MathExampleForm.json` file and injects any sidecar files in the `input_data` folder into the JSON file
libParseCSV.run(['node', 'Harness.js', 'converttocsv', 'data/MathExampleForm.json', '-o', 'data/MathExampleForm-Reconstituted.csv', '-d', 'data/']);
