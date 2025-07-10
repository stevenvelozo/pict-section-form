const libPictViewClass = require('pict-view');

const libPictDynamicFormDependencyManager = require(`../services/Pict-Service-DynamicFormDependencyManager.js`);
const libPictViewDynamicForm = require('./Pict-View-DynamicForm.js');

// TODO: Potentially create an internalized list of views for this to manage, separate from the pict.views object
// TODO: Manage view lifecycle internally, including destruction of views if they are flagged to not be needed.
// Why?  This allows us to dynamically add and remove sections without having to reload the application.

/**
 * @typedef {(a: any, b: any) => number} SortFunction
 */

/**
 * Class representing a PictFormMetacontroller.
 *
 * The metacontroller creates, manages and runs dynamic views and their lifecycle events.
 *
 * @extends libPictViewClass
 */
class PictFormMetacontroller extends libPictViewClass
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'PictFormMetacontroller';

		// Load the dynamic application dependencies if they don't exist
		this.fable.addAndInstantiateSingletonService('PictDynamicFormDependencyManager', libPictDynamicFormDependencyManager.default_configuration, libPictDynamicFormDependencyManager);

		this.lastRenderedViews = [];

		this.formTemplatePrefix = this.pict.providers.MetatemplateGenerator.baseTemplatePrefix;

		this.manifest = this.pict.manifest;
	}

	get viewMarshalDestination()
	{
		return this.pict.providers.DataBroker.marshalDestination;
	}

	set viewMarshalDestination(pValue)
	{
		this.pict.providers.DataBroker.marshalDestination = pValue;
	}

	/**
	 * Marshals data from the view to the model, usually AppData (or configured data store).
	 *
	 * @returns {any} The result of the superclass's onMarshalFromView method.
	 */
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
		return super.onMarshalFromView();
	}

	/**
	 * Marshals the data to the view from the model, usually AppData (or configured data store).
	 *
	 * @returns {any} The result of the super.onMarshalToView() method.
	 */
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
		return super.onMarshalToView();
	}

	gatherInitialBundle(fCallback)
	{
		if (this.manifestDescription && this.manifestDescription.InitialBundle)
		{
			this.log.info(`Gathering initial bundle for ${this.manifestDescription.InitialBundle.length} entities.`);
			return this.pict.EntityProvider.gatherDataFromServer(this.manifestDescription.InitialBundle, fCallback);
		}
		else
		{
			this.log.info('No initial bundle to gather.');
			return fCallback();
		}
	}

	/**
	 * Executes after the initialization of the object.
	 *
	 * @param {ErrorCallback} fCallback - The callback function to be executed after the initialization.
	 * @returns {void}
	 */
	onAfterInitializeAsync(fCallback)
	{

		return super.onAfterInitializeAsync(
			function (pError)
			{
				if (pError)
				{
					return fCallback(pError);
				}
				this.gatherInitialBundle((pError) =>
				{
					// This is safe -- if there is no settings.DefaultFormManifest configuration, it just doesn't do anything
					this.bootstrapPictFormViewsFromManifest();
					// Generate the metatemplate (the container for each section)
					this.generateMetatemplate();

					return fCallback(pError);
				});
			}.bind(this));
	}

	/**
	 * Executes after the view is rendered.
	 * It regenerates the form section templates, renders the form sections,
	 * and optionally populates the form with data.
	 *
	 * @param {import('pict-view').Renderable} pRenderable - The renderable that was rendered.
	 * @param {string} pRenderDestinationAddress - The address where the renderable was rendered.
	 * @param {any} pRecord - The record (data) that was used by the renderable.
	 * @param {string} pContent - The content that was rendered.
	 *
	 * @return {boolean} The result of the superclass's onAfterRender method.
	 */
	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this.regenerateFormSectionTemplates();
		this.renderFormSections();

		if (this.options.AutoPopulateAfterRender)
		{
			this.marshalToView();
		}

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	/**
	 * Executes the solve operation -- automatically solves all dynamic views that are present.
	 *
	 * @returns {any} The result of the solve operation.
	 */
	onSolve()
	{
		this.pict.providers.DynamicSolver.solveViews();
		return super.onSolve();
	}

	onBeforeFilterViews(pViewFilterState)
	{
		return pViewFilterState;
	}

	onAfterFilterViews(pViewFilterState)
	{
		return pViewFilterState;
	}

	/**
	 * Filters the views based on the provided filter and sort functions.
	 *
	 * By default, filters views based on the provided filter function and sorts them based on the provided sort function.
	 *
	 * @param {Function} [fFilterFunction] - The filter function used to determine if a view should be included.
	 * @param {SortFunction} [fSortFunction] - The sort function used to sort the filtered views.
	 * @returns {Array} - The filtered and sorted views.
	 */
	filterViews(fFilterFunction, fSortFunction)
	{
		// Generate the filter state object
		let tmpViewFilterState = (
			{
				ViewHashList: Object.keys(this.pict.views),
				// If there is no customization to the filter or sort, just render the last set.
				RenderLastRenderedViewsWithoutCustomization: true,
				// The last rendered views that were rendered
				LastRenderedViews: this.lastRenderedViews,
				// True or false, if the view should be included in the render.
				FilterFunction: fFilterFunction,
				// The sort function to apply to the views (it is sorting OBJECTS, not strings)
				SortFunction: fSortFunction,
				// The final outcome view list
				FilteredViewList: []
			});

		// Execute the customization function
		tmpViewFilterState = this.onBeforeFilterViews(tmpViewFilterState);

		// Filter the views based on the filter function and type
		for (let i = 0; i < tmpViewFilterState.ViewHashList.length; i++)
		{
			let tmpView = this.fable.views[tmpViewFilterState.ViewHashList[i]];
			// If the filter function returns false, skip this view.
			if (tmpViewFilterState.FilterFunction && !tmpViewFilterState.FilterFunction(tmpView))
			{
				continue;
			}
			if (tmpView.isPictSectionForm)
			{
				if (
					// If you don't pass in a filter and it's a dynamic section but set to not be included in the dynamic render, skip it
					(typeof(tmpViewFilterState.FilterFunction) != 'function')
					&& (!tmpView.sectionDefinition.IncludeInDefaultDynamicRender))
				{
					continue;
				}
				tmpViewFilterState.FilteredViewList.push(tmpView);
			}
			else if (!this.options.OnlyRenderDynamicSections || tmpView.options.IncludeInMetacontrollerOperations)
			{
				// If the OnlyRenderDynamicSections option is false, we will render all views in the array..
				// This is great when the app is small and simple.  And DANGEROUS if it isn't.  Take care!
				tmpViewFilterState.FilteredViewList.push(tmpView);
			}
		}

		// Auto-position any views marked with DynamicPlacementMode or DynamicAnchor - this is to assist with mixing configuration driven forms with
		// custom views.
		const tmpViewsToAutoPosition = tmpViewFilterState.FilteredViewList.filter((v) => v.options.DynamicPlacementMode || v.options.DynamicAnchor);
		for (const tmpView of tmpViewsToAutoPosition)
		{
			const tmpMode = tmpView.options.DynamicPlacementMode || 'After';
			const tmpAnchor = tmpView.options.DynamicAnchor;
			let tmpMovingViewIndex = tmpViewFilterState.FilteredViewList.findIndex((v) => v === tmpView);
			let tmpAnchorViewIndex;

			switch (tmpMode)
			{
			case 'First':
				tmpViewFilterState.FilteredViewList.splice(tmpMovingViewIndex, 1);
				tmpViewFilterState.FilteredViewList.unshift(tmpView);
				break;
			case 'Last':
				tmpViewFilterState.FilteredViewList.splice(tmpMovingViewIndex, 1);
				tmpViewFilterState.FilteredViewList.push(tmpView);
				break;
			case 'Before':
			case 'After':
				tmpAnchorViewIndex = tmpViewFilterState.FilteredViewList.findIndex((v) => v.Hash == tmpAnchor);
				if (tmpAnchorViewIndex < 0)
				{
					// for convenience, also check for dynamic prefixed views if an exact match is not found
					const tmpDynamicAnchor = `PictSectionForm-${tmpAnchor}`;
					tmpAnchorViewIndex = tmpViewFilterState.FilteredViewList.findIndex((v) => v.Hash == tmpDynamicAnchor);
				}
				if (tmpAnchorViewIndex < 0)
				{
					this.log.error(`No anchor view [${tmpAnchor}] found to position view [${tmpView.Hash}] [${tmpMode}].`);
					break;
				}
				tmpViewFilterState.FilteredViewList.splice(tmpMovingViewIndex, 1);
				if (tmpMovingViewIndex < tmpAnchorViewIndex)
				{
					// we just removed the element before the target, so we need to adjust
					--tmpAnchorViewIndex;
				}
				if (tmpMode === 'After')
				{
					// this lets us share most of the code for Before and After
					++tmpAnchorViewIndex;
				}
				tmpViewFilterState.FilteredViewList.splice(tmpAnchorViewIndex, 0, tmpView);
				break;
			default:
				this.log.error(`Not auto-positioning view with unknown DynamicPlacementMode: ${tmpMode}`);
			}
		}

		// Sort the views based on the sort function
		// This is to allow dynamic forms sections to have their own sorting criteria before rendering.
		if (typeof(tmpViewFilterState.SortFunction) == 'function')
		{
			tmpViewFilterState.FilteredViewList.sort(tmpViewFilterState.SortFunction);
		}

		// Execute the after filter customization function
		tmpViewFilterState = this.onAfterFilterViews(tmpViewFilterState);

		return tmpViewFilterState.FilteredViewList;
	}

	/**
	 * Renders a specific dynamic form section based on the provided form section hash.
	 *
	 * For this to work, we need the container for the section to be available on the form.
	 *
	 * @param {string} pFormSectionHash - The hash of the form section to render.
	 * @returns {void}
	 */
	renderSpecificFormSection(pFormSectionHash)
	{
		let fViewFilter = (pView) => { return pView.Hash == pFormSectionHash; };
		this.lastRenderedViews = this.filterViews(fViewFilter);
		this.regenerateFormSectionTemplates();
		this.generateMetatemplate();
		this.render();
	}

	/**
	 * Renders the default dynamic form sections based on the provided form section hash.
	 *
	 * @returns {void}
	 */
	renderDefaultFormSections()
	{
		this.lastRenderedViews = this.filterViews((pView) => { return pView?.sectionDefinition?.IncludeInDefaultDynamicRender ?? false; });
		this.regenerateFormSectionTemplates();
		this.generateMetatemplate();
		this.render();
	}

	/**
	 * Renders the form sections based on the provided filter and sort functions.
	 *
	 * If no filter and sort functions are provided, render all form sections.
	 *
	 * @param {Function} [fFilterFunction] - The filter function used to filter the views.
	 * @param {SortFunction} [fSortFunction] - The sort function used to sort the views.
	 */
	renderFormSections(fFilterFunction, fSortFunction)
	{
		let tmpViewList = this.filterViews(fFilterFunction, fSortFunction);
		for (let i = 0; i < tmpViewList.length; i++)
		{
			if (tmpViewList[i] === this)
			{
				continue;
			}
			tmpViewList[i].render();
		}
	}

	/**
	 * Regenerates the DyunamicForm section templates based on the provided filter and sort function.
	 *
	 * @param {Function} [fFormSectionFilter] - (optional) The filter function used to determine which views to include in the regeneration.
	 * @param {SortFunction} [fSortFunction] - (optional) The sort function used to determine the order of the views in the regeneration.
	 */
	regenerateFormSectionTemplates(fFormSectionFilter, fSortFunction)
	{
		let tmpViewList = this.filterViews(fFormSectionFilter, fSortFunction);
		for (let i = 0; i < tmpViewList.length; i++)
		{
			const tmpView = tmpViewList[i];
			if (tmpView === this)
			{
				continue;
			}
			if (tmpView.isPictSectionForm)
			{
				tmpView.rebuildCustomTemplate();
			}
		}
		// Make sure any form-specific CSS is injected properly.
		this.pict.CSSMap.injectCSS();
	}

	/**
	 * Generates a meta template for the DynamicForm views managed by this Metacontroller.
	 *
	 * @param {Function} [fFormSectionFilter] - (optional) The filter function to apply on the form section.
	 * @param {SortFunction} [fSortFunction] - (optional) The sort function to apply on the form section.
	 * @returns {void}
	 */
	generateMetatemplate(fFormSectionFilter, fSortFunction)
	{
		let tmpTemplate = ``;

		if (!this.formTemplatePrefix)
		{
			this.formTemplatePrefix = this.pict.providers.MetatemplateGenerator.baseTemplatePrefix;;
		}

		// Add the Form Prefix stuff
		tmpTemplate += `{~T:${this.formTemplatePrefix}-Template-Form-Container-Header:Pict.views["${this.Hash}"]~}`;

		let tmpViewList = this.filterViews(fFormSectionFilter, fSortFunction);

		for (let i = 0; i < tmpViewList.length; i++)
		{
			let tmpFormView = tmpViewList[i];
			if (tmpFormView === this)
			{
				continue;
			}
			if (tmpFormView.options.IncludeInMetatemplateSectionGeneration)
			{
				tmpTemplate += `\n{~T:${this.formTemplatePrefix}-Template-Form-Container-Wrap-Prefix:Pict.views["${tmpFormView.Hash}"]~}`;
				if (tmpFormView.isPictSectionForm)
				{
					tmpTemplate += `\n{~T:${this.formTemplatePrefix}-Template-Form-Container:Pict.views["${tmpFormView.Hash}"]~}`;
				}
				else
				{
					//NOTE: For now, requiring the destination address to be an ID for this case
					tmpFormView.options.CustomTargetID = tmpFormView.options.DefaultDestinationAddress.replace(/#/, '');
					tmpTemplate += `\n{~T:${this.formTemplatePrefix}-Template-Form-Container-Custom:Pict.views["${tmpFormView.Hash}"]~}`;
				}
				tmpTemplate += `\n{~T:${this.formTemplatePrefix}-Template-Form-Container-Wrap-Postfix:Pict.views["${tmpFormView.Hash}"]~}`;
			}
			else if (!tmpFormView.isPictSectionForm)
			{
				//NOTE: For now, requiring the destination address to be an ID for this case
				tmpFormView.options.CustomTargetID = tmpFormView.options.DefaultDestinationAddress.replace(/#/, '');
				tmpTemplate += `\n{~T:${this.formTemplatePrefix}-Template-Form-Container-Wrap-Prefix:Pict.views["${tmpFormView.Hash}"]~}`;
				tmpTemplate += `\n{~T:${this.formTemplatePrefix}-Template-Form-Container-Custom:Pict.views["${tmpFormView.Hash}"]~}`;
				tmpTemplate += `\n{~T:${this.formTemplatePrefix}-Template-Form-Container-Wrap-Postfix:Pict.views["${tmpFormView.Hash}"]~}`;
			}
		}
		tmpTemplate += `{~T:${this.formTemplatePrefix}-Template-Form-Container-Footer:Pict.views["${this.Hash}"]~}`;

		this.pict.TemplateProvider.addTemplate(this.options.MetaTemplateHash, tmpTemplate);
	}

	/**
	 * Retrieves a safe clone of the section definition for a given manyfest section description object.
	 *
	 * @param {object} pSectionObject - The section object.
	 * @returns {object|boolean} - The section definition if successful, otherwise false.
	 */
	getSectionDefinition(pSectionObject)
	{
		if (typeof(pSectionObject) != 'object')
		{
			this.log.error('getSectionDefinition() called without a valid section object.');
			return false;
		}

		if (!('Hash' in pSectionObject))
		{
			this.log.error('getSectionDefinition() called without a valid section object hash.');
			return false;
		}

		try
		{
			let tmpSectionDefinition = JSON.parse(JSON.stringify(pSectionObject));

			if (!('Name' in tmpSectionDefinition))
			{
				// If there isn't a name, use the hash
				tmpSectionDefinition.Name = tmpSectionDefinition.Hash;
			}
			if (!('Description' in tmpSectionDefinition))
			{
				// If there isn't a description, use the name
				tmpSectionDefinition.Description = `PICT Section [${tmpSectionDefinition.Name}].`;
			}
			if (!('Groups' in tmpSectionDefinition))
			{
				// If there isn't a groups array, create an empty one
				tmpSectionDefinition.Groups = [];
			}

			return tmpSectionDefinition;
		}
		catch(pError)
		{
			this.log.error(`getSectionDefinition() failed to parse the section object with error: ${pError.message || pError}`);
			return false;
		}
	}

	/**
	 * Bootstraps Pict DynamicForm views from a Manyfest description JSON object.
	 *
	 * @param {Object} pManifestDescription - The manifest description object.
	 * @returns {Array} - An array of section definitions.
	 */
	bootstrapPictFormViewsFromManifest(pManifestDescription)
	{
		let tmpManifestDescription = (typeof(pManifestDescription) === 'object') ? pManifestDescription : false;
		let tmpSectionList = [];

		if (typeof(tmpManifestDescription) != 'object')
		{
			// Check and see if there is a DefaultFormManifest in the settings
			if (('DefaultFormManifest' in this.fable.settings)
				&& typeof(this.fable.settings.DefaultFormManifest) == 'object'
				&& ('Descriptors' in this.fable.settings.DefaultFormManifest))
			{
				tmpManifestDescription = this.fable.settings.DefaultFormManifest;
			}
			else
			{
				this.log.error('PictFormMetacontroller.bootstrapPictFormViewsFromManifest() called without a valid manifest, and no settings.DefaultFormManifest was provided.');
				return tmpSectionList;
			}
		}
		this.manifestDescription = tmpManifestDescription;
		let tmpManifest = this.fable.instantiateServiceProviderWithoutRegistration('Manifest', tmpManifestDescription);

		if (this.options.AutoPopulateDefaultObject)
		{
			// Fill out the defaults at the marshal location if it doesn't exist
			const tmpMarshalDestinationObject = this.pict.providers.DataBroker.marshalDestinationObject;
			if (typeof(tmpMarshalDestinationObject) === 'object')
			{
				tmpManifest.populateDefaults(tmpMarshalDestinationObject);
			}
		}

		// Get the list of Explicitly Defined section hashes from the Sections property of the manifest
		if (('Sections' in tmpManifestDescription) && Array.isArray(tmpManifestDescription.Sections))
		{
			for (let i = 0; i < tmpManifestDescription.Sections.length; i++)
			{
				let tmpSectionDefinition = this.getSectionDefinition(tmpManifestDescription.Sections[i]);

				if (tmpSectionDefinition)
				{
					tmpSectionList.push(tmpSectionDefinition);
				}
			}
		}

		let tmpImplicitSectionHashes = {};

		let tmpDescriptorKeys = Object.keys(tmpManifest.elementDescriptors);

		for (let i = 0; i < tmpDescriptorKeys.length; i++)
		{
			let tmpDescriptor = tmpManifest.elementDescriptors[tmpDescriptorKeys[i]];

			if (
					// If there is an object in the descriptor
					typeof(tmpDescriptor) == 'object' &&
					// AND it has a PictForm property
					('PictForm' in tmpDescriptor) &&
					// AND the PictForm property is an object
					typeof(tmpDescriptor.PictForm) == 'object' &&
					// AND the PictForm object has a Section property
					('Section' in tmpDescriptor.PictForm) &&
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

		// Now load a section view for each section
		for (let i = 0; i < tmpSectionList.length; i++)
		{
			let tmpViewHash = `PictSectionForm-${tmpSectionList[i].Hash}`;

			if (tmpViewHash in this.fable.views)
			{
				this.log.info(`getSectionList() found an existing view for section [${tmpSectionList[i].Hash}] so will be skipped.`);
				continue;
			}
			let tmpViewConfiguration = JSON.parse(JSON.stringify(tmpSectionList[i]));
			if (!('Manifests' in tmpViewConfiguration))
			{
				tmpViewConfiguration.Manifests = {};
			}
			tmpViewConfiguration.Manifests.Section = tmpManifestDescription;
			tmpViewConfiguration.AutoMarshalDataOnSolve = this.options.AutoMarshalDataOnSolve;
			this.pict.addView(tmpViewHash, tmpViewConfiguration, libPictViewDynamicForm);
		}

		if ('PickLists' in tmpManifestDescription)
		{
			let tmpPickListKeys = Object.keys(tmpManifestDescription.PickLists);
			for (let i = 0; i < tmpPickListKeys.length; i++)
			{
				let tmpPickList = tmpManifestDescription.PickLists[tmpPickListKeys[i]];
				this.pict.providers.DynamicMetaLists.buildList(tmpPickList);
			}
		}

		// Now see if there is custom CSS
		for (let i = 0; i < tmpSectionList.length; i++)
		{
			let tmpSection = tmpSectionList[i];
			if (('CustomCSS' in tmpSection) && (typeof(tmpSection.CustomCSS) == 'string'))
			{
				this.pict.CSSMap.addCSS(`PSF-SectionCSS-${tmpSection.Hash}`, tmpSection.CustomCSS);
			}
		}

		return tmpSectionList;
	}

	/**
	 * Trigger an event on all inputs on all views.
	 * @param {string} pEvent - The event to trigger
	 */
	triggerGlobalInputEvent(pEvent)
	{
		let tmpEvent = (typeof(pEvent) === 'string') ? pEvent : this.fable.getUUID();
		let tmpViewHashes = Object.keys(this.pict.views);
		let tmpCompletedHashes = {};
		// Filter the views based on the filter function and type
		for (let i = 0; i < tmpViewHashes.length; i++)
		{
			let tmpView = this.pict.views[tmpViewHashes[i]];
			if (tmpView.isPictSectionForm)
			{
				tmpView.globalInputEvent(tmpEvent, tmpCompletedHashes);
			}
		}
	}

	/**
	 * Returns whether the object is a Pict Metacontroller.
	 *
	 * @returns {boolean} True if the object is a Pict Metacontroller, false otherwise.
	 */
	get isPictMetacontroller()
	{
		return true;
	}
}

module.exports = PictFormMetacontroller;
/** @type {Record<string, any>} */
module.exports.default_configuration = (
{
	"AutoRender": true,

	"AutoPopulateDefaultObject": true,
	"AutoSolveBeforeRender": true,
	"AutoPopulateAfterRender": true,

	"DefaultRenderable": "Pict-Forms-Metacontainer",
	"DefaultDestinationAddress": "#Pict-Form-Container",

	"AutoMarshalDataOnSolve": true,
	"OnlyRenderDynamicSections": true,

	"MetaTemplateHash": "Pict-Forms-Metatemplate",

	"Templates": [
		{
			"Hash": "Pict-Forms-Metatemplate",
			"Template": "<!-- Pict-Forms-Metatemplate HAS NOT BEEN GENERATED; call pict.views.PictFormsMetatemplate.generateMetatemplate() to build the containers -->"
		}
	],
	"Renderables": [
		{
			"RenderableHash": "Pict-Forms-Metacontainer",
			"TemplateHash": "Pict-Forms-Metatemplate",
			"DestinationAddress": "#Pict-Form-Container"
		}
	]
});
