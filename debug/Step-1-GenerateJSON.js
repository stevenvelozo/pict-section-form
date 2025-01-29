const libParseCSV = require('./ParseCSV.js');

// This command takes the `TabularManifestCSV.csv` file and imports it into a JSON file
libParseCSV.run(['node', 'Harness.js', 'import']);
