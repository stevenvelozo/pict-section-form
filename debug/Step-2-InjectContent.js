const libParseCSV = require('./ParseCSV.js');

// This command takes the `data/MathExampleForm.json` file and injects any sidecare files in the `input_data` folder into the JSON file
libParseCSV.run(['node', 'Harness.js', 'inject']);
