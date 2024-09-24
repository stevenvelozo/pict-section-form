const libPictSectionForm = require('../../source/Pict-Section-Form.js');
const packageJSON = require('./package.json');
module.exports = libPictSectionForm.PictFormApplication;
module.exports.default_configuration.pict_configuration = (
		{
			"Product": "Debug",
			"DefaultAppData": require('./DefaultAppData.json'),
			"DefaultFormManifest": require('./DefaultFormManifest.json')
		});