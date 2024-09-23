const libPictSectionForm = require('../../source/Pict-Section-Form.js');
module.exports = libPictSectionForm.PictFormApplication;
module.exports.default_configuration.pict_configuration = (
		{
			"Product": "Debug",
			"DefaultFormManifest": require("./ExampleForm.json")
		});