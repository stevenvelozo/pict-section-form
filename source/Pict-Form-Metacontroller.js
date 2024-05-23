const libPictViewClass = require('pict-view');

const libFormsTemplateProvider = require('./Pict-Section-Form-Provider-Templates.js');

// "What dependency injection in javascript?"
//  -- Ned

class PictFormMetacontroller extends libPictViewClass
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictFormMetacontroller';

		if (!this.pict.providers.PictFormSectionDefaultTemplateProvider)
		{
			let tmpDefaultTemplateProvider = this.pict.addProvider('PictFormSectionDefaultTemplateProvider', libFormsTemplateProvider.default_configuration, libFormsTemplateProvider);
			tmpDefaultTemplateProvider.initialize();
		}

		this.formTemplatePrefix = 'Pict-Forms-Basic';
	}

	onMarshalFromView()
	{
		let tmpViewList = Object.keys(this.fable.views);

		for (let i = 0; i < tmpViewList.length; i++)
		{
			if (this.fable.views[tmpViewList[i]].isPictSectionForm)
			{
				this.fable.views[tmpViewList[i]].marshalFromView();
			}
		}
	}

	onMarshalToView()
	{
		let tmpViewList = Object.keys(this.fable.views);

		for (let i = 0; i < tmpViewList.length; i++)
		{
			if (this.fable.views[tmpViewList[i]].isPictSectionForm)
			{
				this.fable.views[tmpViewList[i]].marshalToView();
			}
		}
	}

	onAfterInitializeAsync(fCallback)
	{
		// This is safe -- if there is no settings.DefaultFormManifest configuration, it just doesn't do anything
		this.bootstrapPictFormViewsFromManifest();

		// Generate the metatemplate (the container for each section)
		this.generateMetatemplate();

		// Right now this doesn't work with async templates and is intentionally so
		// We don't want heavy loading/lifting in the forms controls; if a use case comes up this can change
		this.render();

		this.regenerateAllFormSectionTemplates();

		this.renderAllFormSections();

		return fCallback();
	}

	renderAllFormSections()
	{
		let tmpViewList = Object.keys(this.fable.views);

		for (let i = 0; i < tmpViewList.length; i++)
		{
			if (this.fable.views[tmpViewList[i]].isPictSectionForm)
			{
				this.fable.views[tmpViewList[i]].render();
			}
		}
	}

	regenerateAllFormSectionTemplates()
	{
		let tmpViewList = Object.keys(this.fable.views);

		for (let i = 0; i < tmpViewList.length; i++)
		{
			if (this.fable.views[tmpViewList[i]].isPictSectionForm)
			{
				this.fable.views[tmpViewList[i]].rebuildCustomTemplate();
			}
		}
		// Make sure any form-specific CSS is injected properly.
		this.pict.CSSMap.injectCSS();
	}

	generateMetatemplate()
	{
		let tmpTemplate = ``;

		if (!this.formTemplatePrefix)
		{
			this.formTemplatePrefix = 'Pict-Forms-Basic';
		}

		// Add the Form Prefix stuff
		tmpTemplate += `{~T:${this.formTemplatePrefix}-Template-Form-Container-Header:Pict.views["${this.Hash}"]~}`;

		let tmpViewList = Object.keys(this.pict.views);

		for (let i = 0; i < tmpViewList.length; i++)
		{
			if (this.pict.views[tmpViewList[i]].isPictSectionForm)
			{
				let tmpFormView = this.pict.views[tmpViewList[i]];
				tmpTemplate += `\n{~T:${this.formTemplatePrefix}-Template-Form-Container-Wrap-Prefix:Pict.views["${tmpFormView.Hash}"]~}`;
				tmpTemplate += `\n{~T:${this.formTemplatePrefix}-Template-Form-Container:Pict.views["${tmpFormView.Hash}"]~}`;
				tmpTemplate += `\n{~T:${this.formTemplatePrefix}-Template-Form-Container-Wrap-Postfix:Pict.views["${tmpFormView.Hash}"]~}`;
			}
		}

		this.pict.TemplateProvider.addTemplate(this.options.MetaTemplateHash, tmpTemplate);
	}

	getSectionDefinition(pSectionObject)
	{
		if (typeof(pSectionObject) != 'object')
		{
			this.log.error('getSectionDefinition() called without a valid section object.');
			return false;
		}

		if (!pSectionObject.hasOwnProperty('Hash'))
		{
			this.log.error('getSectionDefinition() called without a valid section object hash.');
			return false;
		}

		try
		{
			let tmpSectionDefinition = JSON.parse(JSON.stringify(pSectionObject));

			if (!tmpSectionDefinition.hasOwnProperty('Name'))
			{
				// If there isn't a name, use the hash
				tmpSectionDefinition.Name = tmpSectionDefinition.Hash;
			}
			if (!tmpSectionDefinition.hasOwnProperty('Description'))
			{
				// If there isn't a description, use the name
				tmpSectionDefinition.Description = `PICT Section [${tmpSectionDefinition.Name}].`;
			}
			if (!tmpSectionDefinition.hasOwnProperty('Groups'))
			{
				// If there isn't a groups array, create an empty one
				tmpSectionDefinition.Groups = [];
			}

			return tmpSectionDefinition;
		}
		catch(pError)
		{
			this.log.error('getSectionDefinition() failed to parse the section object.');
			return false;
		}
	}

	bootstrapPictFormViewsFromManifest(pManifest)
	{
		let tmpManifest = pManifest;
		let tmpSectionList = [];

		if (typeof(tmpManifest) != 'object')
		{
			// Check and see if there is a DefaultFormManifest in the settings
			if (this.fable.settings.hasOwnProperty('DefaultFormManifest')
				&& typeof(this.fable.settings.DefaultFormManifest) == 'object'
				&& this.fable.settings.DefaultFormManifest.hasOwnProperty('Descriptors'))
			{
				tmpManifest = this.fable.settings.DefaultFormManifest;
			}
			else
			{
				this.log.error('PictFormMetacontroller.bootstrapPictFormViewsFromManifest() called without a valid manifest, and no settings.DefaultFormManifest was provided.');
				return tmpSectionList;
			}
		}

		// Get the list of Explicitly Defined section hashes from the Sections property of the manifest
		if (tmpManifest.hasOwnProperty('Sections') && Array.isArray(tmpManifest.Sections))
		{
			for (let i = 0; i < tmpManifest.Sections.length; i++)
			{
				let tmpSectionDefinition = this.getSectionDefinition(tmpManifest.Sections[i]);

				if (tmpSectionDefinition)
				{
					tmpSectionList.push(tmpSectionDefinition);
				}
			}
		}

		// Check if there are any implicitly defined section hashes in the manifest descriptors
		if (tmpManifest.hasOwnProperty('Descriptors') && typeof(tmpManifest.Descriptors) == 'object')
		{
			let tmpImplicitSectionHashes = {};

			let tmpDescriptorKeys = Object.keys(tmpManifest.Descriptors);

			for (let i = 0; i < tmpDescriptorKeys.length; i++)
			{
				let tmpDescriptor = tmpManifest.Descriptors[tmpDescriptorKeys[i]];

				if (
						// If there is an obect in the descriptor
						typeof(tmpDescriptor) == 'object' &&
						// AND it has a PictForm property
						tmpDescriptor.hasOwnProperty('PictForm') &&
						// AND the PictForm property is an object
						typeof(tmpDescriptor.PictForm) == 'object' &&
						// AND the PictForm object has a Section property
						tmpDescriptor.PictForm.hasOwnProperty('Section') && 
						// AND the Section property is a string
						typeof(tmpDescriptor.PictForm.Section) == 'string'
					)
				{
					tmpImplicitSectionHashes[tmpDescriptor.PictForm.Section] = true;
				}
			}

			let tmpImplicitSectionKeys = Object.keys(tmpImplicitSectionHashes);

			for (let i = 0; i < tmpImplicitSectionKeys.length; i++)
			{
				let tmpExistingSection = tmpSectionList.find((pSection) => { return pSection.Hash == tmpImplicitSectionKeys[i]; });

				if (!tmpExistingSection)
				{
					tmpSectionList.push(this.getSectionDefinition({Hash: tmpImplicitSectionKeys[i]}));
				}
			}
		}

		// Now load a section view for each section
		for (let i = 0; i < tmpSectionList.length; i++)
		{
			let tmpViewHash = `PictSectionForm-${tmpSectionList[i].Hash}`;

			if (this.fable.views.hasOwnProperty(tmpViewHash))
			{
				this.log.info(`getSectionList() found an existing view for section [${tmpSectionList[i].Hash}] so will be skipped.`);
				continue;
			}
			let tmpViewConfiguration = JSON.parse(JSON.stringify(tmpSectionList[i]));
			if (!tmpViewConfiguration.hasOwnProperty('Manifests'))
			{
				tmpViewConfiguration.Manifests = {};
			}
			tmpViewConfiguration.Manifests.Section = tmpManifest;
			this.fable.addView(tmpViewHash, tmpViewConfiguration, require('./Pict-Section-Form-View.js'));
		}

		return tmpSectionList;
	}
}

module.exports = PictFormMetacontroller;
module.exports.default_configuration = require('./Pict-Form-Metacontroller-DefaultConfiguration.json');
