// The container for all the Pict-Section-Form related code.

// The main dynamic view class
module.exports = require('./Pict-View-DynamicForm.js');
module.exports.default_configuration = require('./Pict-View-DynamicForm-DefaultConfiguration.json');

// The base provider class for form section templates; meant to be subclassed
module.exports.PictFormTemplateProvider = require('./Pict-Provider-DynamicTemplates.js');

// The metacontroller view
module.exports.PictFormMetacontroller = require('./Pict-View-Form-Metacontroller.js');

// The application container
module.exports.PictFormApplication = require('./Pict-Application-Form.js');
