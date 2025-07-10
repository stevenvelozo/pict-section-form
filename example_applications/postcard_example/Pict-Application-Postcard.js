const libPictApplication = require('pict-application');

const libPictSectionForm = require('../../source/Pict-Section-Form.js');

const libProviderDynamicSection = require('./providers/PictProvider-Dynamic-Sections.js');

const libProviderInputExtension = require('./providers/PictProvider-PostKardInputExtension.js');

const libMainApplicationView = require('./views/PictView-Postcard-MainApplication.js');
const libDynamicInputsView = require('./views/PictView-Postcard-DynamicInputs.js');

const libPictSectionFormsMetacontroller = require('./pict_section_form_capability_override/Pict-Form-Metacontroller.js');

class PostcardApplication extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.pict.addProvider('Postcard-DynamicSection-Provider', libProviderDynamicSection.default_configuration, libProviderDynamicSection);
		this.pict.addProvider('Postcard-Default-Theme-Provider', {}, require('./providers/PictProvider-BestPostcardTheme.js'));

		this.pict.addProvider('PostKardInputExtension', libProviderInputExtension.default_configuration, libProviderInputExtension);

		this.pict.addView('PostcardNavigation', require('./views/PictView-Postcard-Navigation.json'));
		this.pict.addView('PostcardAbout', require('./views/PictView-Postcard-Content-About.json'));
		this.pict.addView('PostcardLegal', require('./views/PictView-Postcard-Content-Legal.json'));

		// Add the pict form service
		this.pict.addServiceType('PictSectionForm', libPictSectionForm);

		// Add the pict form metacontroller service, which provides programmaatic view construction from manifests and render/marshal methods.
		this.pict.addView('PictFormMetacontroller', {}, libPictSectionFormsMetacontroller);

		this.pict.addView('PostcardMainApplication', libMainApplicationView.default_configuration, libMainApplicationView);
		this.pict.addView('PostcardDynamicInputs', libDynamicInputsView.default_configuration, libDynamicInputsView);
	}

	changeToDefaultTheme()
	{
		this.pict.views.PictFormMetacontroller.formTemplatePrefix = this.pict.providers.MetatemplateGenerator.baseTemplatePrefix;
		// This generates the container metatemplates after we switch themes.
		this.pict.views.PictFormMetacontroller.generateMetatemplate();
		// This generates the view templates for each dynamic view generated from config.
		this.pict.views.PictFormMetacontroller.regenerateFormSectionTemplates();
		// Now render the new containers for the dynamic sections
		this.pict.views.PictFormMetacontroller.render();
		// This renders each of the dynamic view form sections.
		this.pict.views.PictFormMetacontroller.renderFormSections();
		// This puts the data into the view from AppData after it's rendered.
		this.marshalDataFromAppDataToView();
	}

	changeToPostcardTheme()
	{
		this.pict.views.PictFormMetacontroller.formTemplatePrefix = 'Postcard-Theme';
		// This generates the container metatemplates after we switch themes.
		this.pict.views.PictFormMetacontroller.generateMetatemplate();
		// This generates the view templates for each dynamic view generated from config.
		this.pict.views.PictFormMetacontroller.regenerateFormSectionTemplates();
		// Now render the new containers for the dynamic sections
		this.pict.views.PictFormMetacontroller.render();
		// This renders each of the dynamic view form sections.
		this.pict.views.PictFormMetacontroller.renderFormSections();
		// This puts the data into the view from AppData after it's rendered.
		this.marshalDataFromAppDataToView();
	}

	onAfterInitializeAsync(fCallback)
	{
		// DOC: This is how you do a direct assignment macro
		this.pict.providers.MetatemplateMacros.additionalInputMacros['DirectAssignment'] = 'data-i-directassignmentstyle="display: inline-block; width: 100%;"';

		// Default to the Pure theme
		this.pict.views.PictFormMetacontroller.formTemplatePrefix = this.pict.providers['Postcard-Default-Theme-Provider'].formsTemplateSetPrefix;

		// Set a custom address for all the views to marshal to.
		// This can also be set on specific views (same property)
		this.pict.AppData.PostKard = { };
		this.pict.views.PictFormMetacontroller.viewMarshalDestination = 'AppData.PostKard';

		this.pict.views.PostcardNavigation.render()
		this.pict.views.PostcardMainApplication.render();
		this.changeToPostcardTheme();
		this.pict.views.PictFormMetacontroller.render();

		return super.onAfterInitializeAsync(fCallback);
	}

	marshalDataFromViewToAppData()
	{
		this.pict.views.PictFormMetacontroller.marshalFromView();
	}

	marshalDataFromAppDataToView()
	{
		this.pict.views.PictFormMetacontroller.marshalToView();
	}
};

module.exports = PostcardApplication

module.exports.default_configuration = require('./Pict-Application-Postcard-Configuration.json');
