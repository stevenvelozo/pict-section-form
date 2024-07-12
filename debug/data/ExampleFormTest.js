const libPictSectionForm = require('../../source/Pict-Section-Form.js');
//const libPictSectionForm = require('pict-section-form');
module.exports = libPictSectionForm.PictFormApplication;
module.exports.default_configuration.pict_configuration = ({ DefaultFormManifest: require("./ExampleForm.json") });