const libPictViewClass = require('pict-view');

const libInformary = require('informary');

const libFormsTemplateProvider = require('./Pict-Section-Form-Provider-Templates.js');

class PictSectionForm extends libPictViewClass
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, require('./Pict-Section-Form-View-DefaultConfiguration.json'), pOptions);

		if (!tmpOptions.Manifests)
		{
			throw new Error('PictSectionForm instantiation attempt without a Manifests in pOptions.Manifest -- cannot instantiate.');
			return;
		}
		if (!tmpOptions.Manifests.hasOwnProperty('Section'))
		{
			throw new Error('PictSectionForm instantiation attempt without a Section manifest in pOptions.Manifests -- cannot instantiate.');
			return;
		}

		// Set the default destination address to be based on the section hash if it hasn't been overridden by the manifest section definition
		if (tmpOptions.DefaultDestinationAddress == '#Pict-Form-Container')
		{
			tmpOptions.DefaultDestinationAddress = `#Pict-Form-Container-${tmpOptions.Hash}`;
		}

		if (tmpOptions.DefaultRenderable == 'Form-Main')
		{
			tmpOptions.DefaultRenderable = `Form-${tmpOptions.Hash}`;
		}

		if (!tmpOptions.SectionTemplateHash)
		{
			tmpOptions.SectionTemplateHash = `Pict-Form-Template-${tmpOptions.Hash}`;
		}

		if (tmpOptions.Renderables.length < 1)
		{
			tmpOptions.Renderables.push(
				{
					RenderableHash: tmpOptions.DefaultRenderable,
					TemplateHash: tmpOptions.SectionTemplateHash,
					// one of append, prepend, replace or append_once
					RenderMethod: 'replace'
				});
		}

		super(pFable, tmpOptions, pServiceHash);

		// Pull in the section definition
		this.sectionDefinition = this.options;
	
		// Initialize the section manifest -- instantiated to live only the lifecycle of this view
		this.sectionManifest = this.fable.instantiateServiceProviderWithoutRegistration('Manifest', this.options.Manifests.Section);

		if (!this.pict.providers.PictFormSectionDefaultTemplateProvider)
		{
			let tmpDefaultTemplateProvider = this.pict.addProvider('PictFormSectionDefaultTemplateProvider', libFormsTemplateProvider.default_configuration, libFormsTemplateProvider);
			tmpDefaultTemplateProvider.initialize();
		}

		// Load any view section-specific templates
		this.formsTemplateSetPrefix = `PFT-${this.Hash}-${this.UUID}`;
		if (this.options.hasOwnProperty('MetaTemplates') && Array.isArray(this.options.MetaTemplates))
		{
			for (let i = 0; i < this.options.MetaTemplates.length; i++)
			{
				let tmpMetaTemplate = this.options.MetaTemplates[i];

				if (tmpMetaTemplate.hasOwnProperty('HashPostfix') && tmpMetaTemplate.hasOwnProperty('Template'))
				{
					let tmpTemplateHash = `${this.formsTemplateSetPrefix}${tmpMetaTemplate.HashPostfix}`;
					this.pict.TemplateProvider.addTemplate(tmpTemplateHash, tmpMetaTemplate.Template);
				}
				else
				{
					this.log.warn(`MetaTemplate entry ${i} in PictSectionForm [${this.UUID}]::[${this.Hash}] does not have a Hash and Template property; custom template skipped.`);
				}
			}
		}
		// The default template prefix
		this.defaultTemplatePrefix = 'Pict-Forms-Basic';

		this.formID = `Pict-Form-${this.Hash}-${this.UUID}`;

		this.informary = new libInformary({ Form:this.formID })

		this.viewMarshalDestination = false;

		// Initialize the solver service if it isn't up
		this.fable.instantiateServiceProviderIfNotExists('ExpressionParser');

		this.initializeFormGroups();
		this.rebuildMacros();
	}

	dataChanged(pInputHash)
	{
		// This is what is called whenever a hash is changed.  We could marshal from view, solve and remarshal to view.
		// TODO: Determine best pattern for allowing others to override this without subclassing this.  Maybe a registered provider type?
		this.marshalFromView();
		this.pict.PictApplication.solve();
		this.marshalToView();
	}

	getMarshalDestinationObject()
	{
		let tmpMarshalDestinationObject = false;
		if (this.viewMarshalDestination)
		{
			tmpMarshalDestinationObject = this.sectionManifest.getValueAtAddress(this, this.viewMarshalDestination);
		}
		else if (this.pict.views.PictFormMetacontroller && this.pict.views.PictFormMetacontroller.viewMarshalDestination)
		{
			tmpMarshalDestinationObject = this.sectionManifest.getValueAtAddress(this, this.pict.views.PictFormMetacontroller.viewMarshalDestination);

			if (!tmpMarshalDestinationObject)
			{
				// Try to create an empty object.
				if (this.sectionManifest.setValueAtAddress(this, this.pict.views.PictFormMetacontroller.viewMarshalDestination, {}))
				{
					// And try to load it once more!
					tmpMarshalDestinationObject = this.sectionManifest.getValueAtAddress(this, this.pict.views.PictFormMetacontroller.viewMarshalDestination);
				}
			}
		}

		if (typeof(tmpMarshalDestinationObject) != 'object')
		{
			this.log.error(`Marshal destination object is not an object; if you initialize the view yourself you must set the viewMarshalDestination property to a valid address within the view.  Falling back to AppData.`);
			tmpMarshalDestinationObject = this.pict.AppData;
		}

		return tmpMarshalDestinationObject;
	}

	onMarshalToView()
	{
		try
		{
			let tmpMarshalDestinationObject = this.getMarshalDestinationObject();

			this.informary.marshalDataToForm(tmpMarshalDestinationObject,
				function(pError)
				{
					if (pError)
					{
						this.log.error(`Error marshaling data to view: ${pError}`);
					}
				});
		}
		catch (pError)
		{
			this.log.error(`Gross error marshaling data to view: ${pError}`);
		}

		return super.onMarshalToView();
	}

	onMarshalFromView()
	{
		try
		{
			let tmpMarshalDestinationObject = this.getMarshalDestinationObject();

			if (typeof(tmpMarshalDestinationObject) != 'object')
			{
				this.log.error(`Marshal destination object is not an object; if you initialize the view yourself you must set the viewMarshalDestination property to a valid address within the view.  Falling back to AppData.`);
				tmpMarshalDestinationObject = this.pict.AppData;
			}

			this.informary.marshalFormToData(tmpMarshalDestinationObject,
				function(pError)
				{
					if (pError)
					{
						this.log.error(`Error marshaling data from view: ${pError}`);
					}
				});
		}
		catch (pError)
		{
			this.log.error(`Gross error marshaling data from view: ${pError}`);
		}
		return super.onMarshalFromView();
	}

	onSolve()
	{
		if (this.options.AutoMarshalDataOnSolve)
		{
			this.marshalFromView();
		}

		if (Array.isArray(this.options.Solvers))
		{
			for (let i = 0; i < this.options.Solvers.length; i++)
			{
				// TODO: Precompile the solvers (it's super easy)
				this.log.trace(`Dynamic View [${this.UUID}]::[${this.Hash}] solving equation ${i} [${this.options.Solvers[i]}]`);

				let tmpResultsObject = {};

				let tmpSolutionValue = this.fable.ExpressionParser.solve(this.options.Solvers[i], this.getMarshalDestinationObject(), tmpResultsObject, this.sectionManifest, this.getMarshalDestinationObject());

				this.log.trace(`[${this.options.Solvers[i]}] result was ${tmpSolutionValue}`);
			}
		}

		if (this.options.AutoMarshalDataOnSolve)
		{
			this.marshalToView();
		}
		return super.onSolve();
	}

	initializeFormGroups()
	{
		// Enumerate the manifest and make sure a group exists for each group in the section definition
		let tmpDescriptorKeys = Object.keys(this.options.Manifests.Section.Descriptors);
		for (let i = 0; i < tmpDescriptorKeys.length; i++)
		{
			let tmpDescriptor = this.options.Manifests.Section.Descriptors[tmpDescriptorKeys[i]];

			if (
					// If there is an obect in the descriptor
					typeof(tmpDescriptor) == 'object' &&
					// AND it has a PictForm property
					tmpDescriptor.hasOwnProperty('PictForm') &&
					// AND the PictForm property is an object
					typeof(tmpDescriptor.PictForm) == 'object' &&
					// AND the PictForm object has a Section property
					tmpDescriptor.PictForm.hasOwnProperty('Section') &&
					// AND the Section property matches our section hash
					tmpDescriptor.PictForm.Section == this.sectionDefinition.Hash
				)
			{
				tmpDescriptor.PictForm.InformaryDataAddress = tmpDescriptorKeys[i];

				let tmpGroupHash = (typeof(tmpDescriptor.PictForm.Group) == 'string') ? tmpDescriptor.PictForm.Group : 'Default';
				
				let tmpGroup = this.sectionDefinition.Groups.find((pGroup) => { return pGroup.Hash == tmpGroupHash; });

				if (!tmpGroup)
				{
					tmpGroup = { Hash: tmpGroupHash, Name: tmpGroupHash, Description: false, Rows: [] };
					this.sectionDefinition.Groups.push(tmpGroup);
				}
				else if (!Array.isArray(tmpGroup.Rows))
				{
					tmpGroup.Rows = [];
				}

				let tmpRowHash = (typeof(tmpDescriptor.PictForm.Row) == 'string') ? tmpDescriptor.PictForm.Row :
								(typeof(tmpDescriptor.PictForm.Row) == 'number') ? `Row_${tmpDescriptor.PictForm.Row.toString()}` :
								'Row_Default';

				tmpDescriptor.PictForm.RowHash = tmpRowHash;

				let tmpRow = tmpGroup.Rows.find((pRow) => { return pRow.Hash == tmpRowHash; });

				if (!tmpRow)
				{
					tmpRow = { Hash: tmpRowHash, Name: tmpRowHash, Inputs: [] };
					tmpGroup.Rows.push(tmpRow);
					tmpRow.Inputs.push(tmpDescriptor);
				}
				else
				{
					tmpRow.Inputs.push(tmpDescriptor);
				}
			}
		}
	}

	rebuildMacros()
	{
		if (!this.options.hasOwnProperty('MacroTemplates'))
		{
			return false;
		}

		// Section macros
		let tmpSectionMacroKeys = Object.keys(this.options.MacroTemplates.Section);
		if (typeof(this.sectionDefinition.Macro) !== 'object')
		{
			this.sectionDefinition.Macro = {};
		}
		for (let n = 0; n < tmpSectionMacroKeys.length; n++)
		{
			this.sectionDefinition.Macro[tmpSectionMacroKeys[n]] = this.pict.parseTemplate (this.options.MacroTemplates.Section[tmpSectionMacroKeys[n]], this.sectionDefinition, null, [this]);
		}
		for (let i = 0; i < this.sectionDefinition.Groups.length; i++)
		{
			let tmpGroup = this.sectionDefinition.Groups[i];
			// Group Macros
			let tmpGroupMacroKeys = Object.keys(this.options.MacroTemplates.Group);
			if (!tmpGroup.hasOwnProperty('Macro'))
			{
				tmpGroup.Macro = {};
			}
			for (let n = 0; n < tmpGroupMacroKeys.length; n++)
			{
				tmpGroup.Macro[tmpGroupMacroKeys[n]] = this.pict.parseTemplate (this.options.MacroTemplates.Group[tmpGroupMacroKeys[n]], tmpGroup, null, [this]);
			}

			if (!Array.isArray(tmpGroup.Rows))
			{
				continue;
			}

			for (let j = 0; j < tmpGroup.Rows.length; j++)
			{
				// TODO: Do we want row macros?  Let's be still and find out.
				let tmpRow = tmpGroup.Rows[j];
				for (let k = 0; k < tmpRow.Inputs.length; k++)
				{
					let tmpInput = tmpRow.Inputs[k];
					// Input Macros
					let tmpInputMacroKeys = Object.keys(this.options.MacroTemplates.Input);
					if (!tmpInput.hasOwnProperty('Macro'))
					{
						tmpInput.Macro = {};
					}
					for (let n = 0; n < tmpInputMacroKeys.length; n++)
					{
						tmpInput.Macro[tmpInputMacroKeys[n]] = this.pict.parseTemplate (this.options.MacroTemplates.Input[tmpInputMacroKeys[n]], tmpInput, null, [this]);
					}
				}
			}
		}
	}

	checkViewSpecificTemplate(pTemplatePostfix)
	{
		// This is here to cut down on complex guards, and, so we can optimize/extend it later if we need to.
		return this.pict.TemplateProvider.templates.hasOwnProperty(`${this.formsTemplateSetPrefix}${pTemplatePostfix}`)
	}

	checkThemeSpecificTemplate(pTemplatePostfix)
	{
		// This is here to cut down on complex guards, and, so we can optimize/extend it later if we need to.
		return this.pict.TemplateProvider.templates.hasOwnProperty(`${this.defaultTemplatePrefix}${pTemplatePostfix}`)
	}

	getMetatemplateTemplateReference(pTemplatePostfix, pViewDataAddress)
	{
		/* This is to abstract the logic of checking for section-specific templates on the metatemplate generation
		* lines.
		* A separate function is provided for inputs doing a similar thing with scopes.
		*/
		/*
		* This is to replace blocks like this:
			if (this.pict.TemplateProvider.getTemplate(`${this.formsTemplateSetPrefix}-Template-Wrap-Prefix`))
			{
				tmpTemplate += `{~T:${this.formsTemplateSetPrefix}-Template-Wrap-Prefix:Pict.views["${this.Hash}"].sectionDefinition~}`;
			}
			else
			{
				tmpTemplate += `{~T:${this.defaultTemplatePrefix}-Template-Wrap-Prefix:Pict.views["${this.Hash}"].sectionDefinition~}`;
			}
		*/
		// 1. Check if there is a section-specific template loaded
		if (this.checkViewSpecificTemplate(pTemplatePostfix))
		{
			return `\n{~T:${this.formsTemplateSetPrefix}${pTemplatePostfix}:Pict.views["${this.Hash}"].${pViewDataAddress}~}`
		}
		else if (this.checkThemeSpecificTemplate(pTemplatePostfix))
		{
			return `\n{~T:${this.defaultTemplatePrefix}${pTemplatePostfix}:Pict.views["${this.Hash}"].${pViewDataAddress}~}`
		}
		else
		{
			return false;
		}
	}

	getInputMetatemplateTemplateReference(pDataType, pInputType, pViewDataAddress)
	{
		// Input types are customizable -- there could be 30 different input types for the string data type with special handling and templates
		let tmpTemplateInputTypePostfix = `-Template-Input-InputType-${pInputType}`;
		// Data types are not customizable; they are a fixed list based on what is available in Manyfest
		let tmpTemplateDataTypePostfix = `-Template-Input-DataType-${pDataType}`;

		// First check if there is an "input type" template available in either the section-specific configuration or in the general
		if (pInputType)
		{
			let tmpTemplate = this.getMetatemplateTemplateReference(tmpTemplateInputTypePostfix, pViewDataAddress);
			if (tmpTemplate)
			{
				return tmpTemplate;
			}
		}

		// If we didn't find the template for the "input type", check for the "data type"
		let tmpTemplate = this.getMetatemplateTemplateReference(tmpTemplateDataTypePostfix, pViewDataAddress);
		if (tmpTemplate)
		{
			return tmpTemplate;
		}
	
		// There wasn't an input type specific or data type specific template, so fall back to the generic input template.
		return this.getMetatemplateTemplateReference('-Template-Input', pViewDataAddress);
	}

	rebuildCustomTemplate()
	{
		let tmpTemplate = ``;

		if (this.pict.views.PictFormMetacontroller)
		{
			if (this.pict.views.PictFormMetacontroller.hasOwnProperty('formTemplatePrefix'))
			{
				this.defaultTemplatePrefix = this.pict.views.PictFormMetacontroller.formTemplatePrefix;
			}
		}

		tmpTemplate += this.getMetatemplateTemplateReference(`-Template-Wrap-Prefix`, `sectionDefinition`);
		tmpTemplate += this.getMetatemplateTemplateReference(`-Template-Section-Prefix`, `sectionDefinition`);

		for (let i = 0; i < this.sectionDefinition.Groups.length; i++)
		{
			let tmpGroup = this.sectionDefinition.Groups[i];

			tmpTemplate += this.getMetatemplateTemplateReference(`-Template-Group-Prefix`, `sectionDefinition.Groups[${i}]`)

			if (!Array.isArray(tmpGroup.Rows))
			{
				continue;
			}

			for (let j = 0; j < tmpGroup.Rows.length; j++)
			{
				let tmpRow = tmpGroup.Rows[j];

				tmpTemplate += this.getMetatemplateTemplateReference(`-Template-Row-Prefix`, `sectionDefinition.Groups[${i}]`)
				for (let k = 0; k < tmpRow.Inputs.length; k++)
				{
					let tmpInput = tmpRow.Inputs[k];

					tmpTemplate += this.getInputMetatemplateTemplateReference(tmpInput.DataType, tmpInput.PictForm.InputType, `sectionDefinition.Groups[${i}].Rows[${j}].Inputs[${k}]`);
				}
				tmpTemplate += this.getMetatemplateTemplateReference(`-Template-Row-Postfix`, `sectionDefinition.Groups[${i}]`)
			}
			tmpTemplate += this.getMetatemplateTemplateReference(`-Template-Group-Postfix`, `sectionDefinition.Groups[${i}]`)
		}

		tmpTemplate += this.getMetatemplateTemplateReference(`-Template-Section-Postfix`, `sectionDefinition`);
		tmpTemplate += this.getMetatemplateTemplateReference(`-Template-Wrap-Postfix`, `sectionDefinition`);

		this.pict.TemplateProvider.addTemplate(this.options.SectionTemplateHash, tmpTemplate);
	}

	get isPictSectionForm()
	{
		return true;
	}
}

module.exports = PictSectionForm;