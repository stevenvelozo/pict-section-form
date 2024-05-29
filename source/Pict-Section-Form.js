// The container for all the Pict-Section-Form related code.

// The main pict-section-form view class
module.exports = require('./Pict-Section-Form-View.js');
module.exports.default_configuration = require('./Pict-Section-Form-View-DefaultConfiguration.json');

// The base provider class for form section templates; meant to be subclassed
module.exports.PictFormTemplateProvider = require('./Pict-Section-Form-Provider-Templates.js');

// The metatemplate generator provider
// (if we decide to abstract this out from the view class)
// module.exports.PictFormMetatemplateGenerator = require('./Pict-Section-Form-MetatemplateGenerator.js');

// The metacontroller view
module.exports.PictFormMetacontroller = require('./Pict-Form-Metacontroller.js');

// The application container
module.exports.PictFormApplication = require('./Pict-Section-Form-Application.js');
