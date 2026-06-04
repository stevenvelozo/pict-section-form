// The container for all the Pict-Section-Form related code.

// The main dynamic view class
module.exports = require('./views/Pict-View-DynamicForm.js');
//module.exports.default_configuration = require('./views/Pict-View-DynamicForm-DefaultConfiguration.json');

// The dynamic application dependencies
module.exports.PictDynamicFormDependencyManager = require('./services/Pict-Service-DynamicFormDependencyManager.js');

// The base provider class for form section templates; meant to be subclassed
module.exports.PictFormTemplateProvider = require('./providers/Pict-Provider-DynamicTemplates.js');

// The base provider class for Input Extensions
module.exports.PictInputExtensionProvider = require('./providers/Pict-Provider-InputExtension.js');

// The metacontroller view
module.exports.PictFormMetacontroller = require('./views/Pict-View-Form-Metacontroller.js');

// The application container
module.exports.PictFormApplication = require('./application/Pict-Application-Form.js');

// The dynamic layout provider
module.exports.PictDynamicLayoutProvider = require('./providers/Pict-Provider-DynamicLayout.js');

// The ManifestFactory, for when we want to convert tabular data to configuration
module.exports.ManifestFactory = require('./services/ManifestFactory.js');
module.exports.ManifestConversionToCSV = require('./services/ManifestConversionToCSV.js');

// Reveal the support base class
module.exports.PictFormSupportBase = require('./views/support/Pict-View-PSF-SupportBase.js');

// The optional form persistence provider for offline data storage
module.exports.PictFormPersistenceProvider = require('./providers/Pict-Provider-FormPersistence.js');


// The extension views
module.exports.ExtensionViews = (
	{
		LifecycleVisualization: require('./views/support/Pict-View-PSF-LifeCycle-Visualization.js'),
		DebugViewer: require('./views/support/Pict-View-PSF-DebugViewer.js')
	});

// Complex InputTypes — heavy editor deps (markdowneditor, excalidraw) are
// lazy-required by the providers themselves on first setMode('edit'). The
// require below is just for the provider class; nothing heavy loads here.
module.exports.RichTextInput = require('./providers/inputs/Pict-Provider-Input-RichText.js');
module.exports.DiagramInput  = require('./providers/inputs/Pict-Provider-Input-Diagram.js');

// SVG palette → theme-CSS-variable rewriter. Re-exported so consumers can
// theme stored SVGs without needing pict-section-excalidraw.
module.exports.themeifySVG = require('./providers/inputs/util/Themeify-SVG.js').themeifySVG;