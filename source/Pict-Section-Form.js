// The container for all the Pict-Section-Form related code.

// The main dynamic view class
module.exports = require('./views/Pict-View-DynamicForm.js');
module.exports.default_configuration = require('./views/Pict-View-DynamicForm-DefaultConfiguration.json');

// The base provider class for form section templates; meant to be subclassed
module.exports.PictFormTemplateProvider = require('./providers/Pict-Provider-DynamicTemplates.js');

// The base provider class for Input Extensions
module.exports.PictInputExtensionProvider = require('./providers/Pict-Provider-InputExtension.js');

// The metacontroller view
module.exports.PictFormMetacontroller = require('./views/Pict-View-Form-Metacontroller.js');

// The application container
module.exports.PictFormApplication = require('./application/Pict-Application-Form.js');

// The ManifestFactory, for when we want to convert tabular data to configuration
module.exports.ManifestFactory = require('./services/ManifestFactory.js');