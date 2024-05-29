# For Pict-Applications

If you want to initialize this manually, rather than use the default objects
that the metacontroller provides you can do this:

```js
	onAfterInitializeAsync(fCallBack)
	{
		// The metacontroller does this on after initialize already.
		// These next two lines are synonymous, since our provider loads the manifests into the DefaultFormManifest settings location
		//this.pict.PictFormMetacontroller.bootstrapPictFormViewsFromManifest();
		//this.PictFormMetacontroller.bootstrapFormManifests(this.pict.settings.DefaultFormManifest);

		// The metacontroller does this as well on after initialize
		//this.pict.PictFormMetacontroller.renderAllFormSections();

		return super.onAfterInitializeAsync(fCallBack);
	}
```

## The Non-abstracted Form Section Metatemplate Generator

This is before section layouts and row layouts were introduced, which add some 
signifiicant complexity.

```js
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
```