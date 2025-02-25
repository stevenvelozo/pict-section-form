
let libPictCommandLineUtility = require('pict-service-commandlineutility');

const _ProgramConfiguration = (
	{
		Product: 'PictSection-TabularCSV-Input',
		Version: '0.0.2',
		
		// The command is very similar to PTSD
		Command: 'pstcsvi',
		Description: 'Pict Section Tabular CSV Input',

		ProgramConfigurationFileName: '.pict-cli-debugharness-config.json',

		DefaultProgramConfiguration: { },

		AutoGatherProgramConfiguration: true,
		AutoAddConfigurationExplanationCommand: true
	});

let _Program = new libPictCommandLineUtility(_ProgramConfiguration,
	[
		require('./ParseCSV-Command-Inject.js'),
		require('./ParseCSV-Command-Parse.js')
	]);
_Program.LogNoisiness = 4;

module.exports = _Program;