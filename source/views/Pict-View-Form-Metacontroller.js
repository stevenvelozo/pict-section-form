const libPictViewClass = require('pict-view');

const libPictDynamicFormDependencyManager = require(`../services/Pict-Service-DynamicFormDependencyManager.js`);
const libPictViewDynamicForm = require('./Pict-View-DynamicForm.js');

// TODO: Potentially create an internalized list of views for this to manage, separate from the pict.views object
// TODO: Manage view lifecycle internally, including destruction of views if they are flagged to not be needed.
// Why?  This allows us to dynamically add and remove sections without having to reload the application.

const PENDING_ASYNC_OPERATION_TYPE = 'PendingAsyncOperation';
const TRANSACTION_COMPLETE_CALLBACK_TYPE = 'onTransactionComplete';
const READY_TO_FINALIZE_TYPE = 'ReadyToFinalize';

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

		this.SupportViewPrototypes = (
		{
			LifecycleVisualization: require('./support/Pict-View-PSF-LifeCycle-Visualization.js'),
			DebugViewer: require('./support/Pict-View-PSF-DebugViewer.js'),
			AppDataViewer: require('./support/Pict-View-PSF-AppData-Visualization.js'),
			SolverVisualization: require('./support/Pict-View-PSF-Solver-Visualization.js'),
			SpecificSolveVisualization: require('./support/Pict-View-PSF-SpecificSolve-Visualization.js'),
		});
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
	 *
	 * @return {boolean} The result of the superclass's onAfterRender method.
	 */
	onAfterRender(pRenderable)
	{
		const res = super.onAfterRender(pRenderable);
		this.regenerateFormSectionTemplates();
		this.renderFormSections();

		if (this.options.AutoPopulateAfterRender)
		{
			this.marshalToView();
		}
		return res;
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
	 * @param {string} pSectionManifestHash - The hash of the section to find.
	 *
	 * @return {Record<string, any>} The section definition object, or undefined if not found.
	 */
	findDynamicSectionManifestDefinition(pSectionManifestHash)
	{
		const sectionManifest = this.manifestDescription?.ReferenceManifests?.[pSectionManifestHash];
		if (typeof(sectionManifest) !== 'object')
		{
			this.log.error(`findDynamicSectionManifestDefinition() could not find a section manifest with hash [${pSectionManifestHash}]`);
			return null;
		}
		return sectionManifest;
	}

	/**
	 * @param {Record<string, any>} pManifest - The manifest to add
	 * @param {string} [pAfterSectionHash] - The hash of the section to add after. Omit to add to the start.
	 * @param {string} [pUUID] - (optional) The UUID to use for uniqueness. If not provided, a new one will be generated.
	 *
	 * @return {Array<import('./Pict-View-DynamicForm.js')>} the views that correspond to the newly added sections
	 */
	injectManifestAndRender(pManifest, pAfterSectionHash, pUUID)
	{
		const tmpManifest = pUUID ? this.createDistinctManifest(pManifest, pUUID) : pManifest;
		const tmpViewsToRender = this.injectManifest(tmpManifest, pAfterSectionHash);
		this.updateMetatemplateInDOM();
		//FIXME: for some reason, DOM append is not synchronous, so we need to delay the render....................?
		setTimeout(() =>
		{
			for (const tmpViewToRender of tmpViewsToRender)
			{
				tmpViewToRender.render();
			}
		}, 0);

		return tmpViewsToRender;
	}

	/**
	 * @param {Record<string, any>} pManifest - The manifest to add
	 * @param {string} [pAfterSectionHash] - The hash of the section to add after. Omit to add to the start.
	 *
	 * @return {Array<import('./Pict-View-DynamicForm.js')>} the views that correspond to the newly added sections; note that these views are NOT rendered yet
	 */
	injectManifest(pManifest, pAfterSectionHash)
	{
		const tmpAfterSectionHash = pAfterSectionHash ? (pAfterSectionHash.startsWith('PictSectionForm-') ? pAfterSectionHash : `PictSectionForm-${pAfterSectionHash}`) : null;
		const tmpAllViewKeys = Object.keys(this.pict.views);
		const tmpReferenceManifestViewIndex = tmpAfterSectionHash ? tmpAllViewKeys.indexOf(tmpAfterSectionHash) : -1;
		const tmpViewsToShift = [];
		if (tmpReferenceManifestViewIndex >= 0)
		{
			// reorder views (hacky - add layer to do this more directly)
			for (let i = tmpReferenceManifestViewIndex + 1; i < tmpAllViewKeys.length; i++)
			{
				const tmpKey = tmpAllViewKeys[i];
				tmpViewsToShift.push({ key: tmpKey, view: this.pict.views[tmpKey] });
				delete this.pict.views[tmpKey];
			}
		}
		const tmpViewsToRender = this.bootstrapAdditiveManifest(pManifest, tmpAfterSectionHash);
		for (const tmpViewToShift of tmpViewsToShift)
		{
			this.pict.views[tmpViewToShift.key] = tmpViewToShift.view;
		}
		// this ensures if we re-render everything, we have the new sections in the template
		this.generateMetatemplate();
		for (const tmpViewToRender of tmpViewsToRender)
		{
			tmpViewToRender.rebuildCustomTemplate();
		}
		this.pict.CSSMap.injectCSS();

		return tmpViewsToRender;
	}

	/**
	 * Changes:
	 *   * The hashes of each section+group to be globally unique.
	 *   * The data address of each element to map to a unique location.
	 *
	 * @param {Record<string, any>} pManifest - The manifest to create a distinct copy of.
	 * @param {string} [pUUID] - (optional) The UUID to use for uniqueness. If not provided, a new one will be generated.
	 *
	 * @return {Record<string, any>} A distinct copy of the manifest.
	 */
	createDistinctManifest(pManifest, pUUID)
	{
		const tmpUUID = pUUID != null ? pUUID : this.pict.getUUID().replace(/-/g, '');
		const tmpManifest = JSON.parse(JSON.stringify(pManifest));
		for (const tmpSection of tmpManifest.Sections || [])
		{
			tmpSection.Hash = `${tmpSection.Hash}_${tmpUUID}`;
			for (const tmpGroup of tmpSection.Groups || [])
			{
				tmpGroup.Hash = `${tmpGroup.Hash}_${tmpUUID}`;
			}
		}
		const tmpNewDescriptors = {};
		for (const [ tmpKey, tmpDescriptor ] of Object.entries(tmpManifest.Descriptors || {}))
		{
			//FIXME: do we want to allow prefixing the data address? (ex. nesting it under a parent object) - caller can still do this themselves.
			tmpDescriptor.DataAddress = `${tmpDescriptor.DataAddress || tmpKey}_${tmpUUID}`;
			if (tmpDescriptor.Hash)
			{
				tmpDescriptor.Hash = `${tmpDescriptor.Hash}_${tmpUUID}`;
			}
			if (tmpDescriptor.PictForm)
			{
				if (tmpDescriptor.PictForm.Section)
				{
					tmpDescriptor.PictForm.Section = `${tmpDescriptor.PictForm.Section}_${tmpUUID}`;
				}
				if (tmpDescriptor.PictForm.Group)
				{
					tmpDescriptor.PictForm.Group = `${tmpDescriptor.PictForm.Group}_${tmpUUID}`;
				}
			}
			tmpNewDescriptors[`${tmpKey}_${tmpUUID}`] = tmpDescriptor;
		}
		tmpManifest.Descriptors = tmpNewDescriptors;
		return tmpManifest;
	}

	/**
	 * @param {Array<string>} pManifestHashes - The hashes of the manifests to add.
	 * @param {string} [pAfterSectionHash] - The hash of the section to add after. Omit to add to the start.
	 * @param {string} [pUUID] - (optional) The UUID to use for uniqueness. If not provided, a new one will be generated.
	 */
	injectManifestsByHash(pManifestHashes, pAfterSectionHash, pUUID)
	{
		let tmpViewsToRender = [];
		for (const tmpManifestHash of pManifestHashes)
		{
			const tmpManifest = this.findDynamicSectionManifestDefinition(tmpManifestHash);
			if (tmpManifest)
			{
				const tmpUniqueManifest = this.createDistinctManifest(tmpManifest, pUUID);
				const tmpViews = this.injectManifest(tmpUniqueManifest, pAfterSectionHash);
				tmpViewsToRender = tmpViewsToRender.concat(tmpViews);
			}
		}
		this.updateMetatemplateInDOM();
		setTimeout(() =>
		{
			for (const tmpViewToRender of tmpViewsToRender)
			{
				tmpViewToRender.render();
			}
		}, 0);
	}

	/**
	 * @param {Record<string, any>} pSectionsManifest - The section definition object.
	 * @param {string} [pAfterSectionHash] - The hash of the section to add after. Omit to add to the start.
	 */
	bootstrapAdditiveManifest(pSectionsManifest, pAfterSectionHash)
	{
		const tmpViewsToRender = [];
		const tmpNewSectionDefinitions = this.bootstrapPictFormViewsFromManifest(pSectionsManifest, pAfterSectionHash);
		for (const tmpNewSectionDefinition of tmpNewSectionDefinitions)
		{
			const tmpView = this.pict.views[`PictSectionForm-${tmpNewSectionDefinition.Hash}`];
			if (tmpView)
			{
				tmpViewsToRender.push(tmpView);
			}
		}
		return tmpViewsToRender;
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
				//FIXME: need to be able to control this order better - adding dynamic sections will always put them at the end, which is rarely what you want
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
	 * Marshals data to the form sections based on the provided filter and sort functions
	 *
	 * If no filter and sort functions are provided, render all form sections.
	 *
	 * @param {Function} [fFilterFunction] - The filter function used to filter the views.
	 * @param {SortFunction} [fSortFunction] - The sort function used to sort the views.
	 */
	marshalFormSections(fFilterFunction, fSortFunction)
	{
		let tmpViewList = this.filterViews(fFilterFunction, fSortFunction);
		for (let i = 0; i < tmpViewList.length; i++)
		{
			if (tmpViewList[i] === this)
			{
				continue;
			}
			tmpViewList[i].marshalToView();
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
			this.formTemplatePrefix = this.pict.providers.MetatemplateGenerator.baseTemplatePrefix;
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
	 * Generates a meta template for the DynamicForm views managed by this Metacontroller.
	 *
	 * @param {Function} [fFormSectionFilter] - (optional) The filter function to apply on the form section.
	 * @param {SortFunction} [fSortFunction] - (optional) The sort function to apply on the form section.
	 *
	 * @return {void}
	 */
	updateMetatemplateInDOM(fFormSectionFilter, fSortFunction)
	{
		if (!this.formTemplatePrefix)
		{
			this.formTemplatePrefix = this.pict.providers.MetatemplateGenerator.baseTemplatePrefix;
		}

		let tmpViewList = this.filterViews(fFormSectionFilter, fSortFunction);
		let tmpPrevDiv = null;
		let tmpDeferredDivContent;
		let tmpDeferredDivID = null;

		for (let i = 0; i < tmpViewList.length; i++)
		{
			let tmpFormView = tmpViewList[i];
			if (tmpFormView === this)
			{
				continue;
			}
			if (!tmpFormView.isPictSectionForm)
			{
				continue;
			}
			if (!tmpFormView.options.IncludeInMetatemplateSectionGeneration)
			{
				continue;
			}
			const tmpFormDivID = tmpFormView.options.CustomTargetID || `Pict-${this.UUID}-${tmpFormView.options.Hash}-Wrap`;
			let tmpFormDivs = this.pict.ContentAssignment.getElement(`#${tmpFormDivID}`);
			if (tmpFormDivs.length > 0)
			{
				const tmpFormDiv = tmpFormDivs[0];
				if (tmpDeferredDivID)
				{
					// We have a deferred div ID, so we need to insert it before this one
					this.pict.ContentAssignment.insertContentBefore(`#${tmpFormDivID}`, tmpDeferredDivContent);
					tmpDeferredDivID = null;
					tmpDeferredDivContent = null;
				}
				tmpPrevDiv = tmpFormDiv;
				continue;
			}
			let tmpFormDivTemplate = '';
			if (tmpFormView.options.IncludeInMetatemplateSectionGeneration)
			{
				tmpFormDivTemplate += `\n{~T:${this.formTemplatePrefix}-Template-Form-Container-Wrap-Prefix:Pict.views["${tmpFormView.Hash}"]~}`;
				if (tmpFormView.isPictSectionForm)
				{
					tmpFormDivTemplate += `\n{~T:${this.formTemplatePrefix}-Template-Form-Container:Pict.views["${tmpFormView.Hash}"]~}`;
				}
				else
				{
					//NOTE: For now, requiring the destination address to be an ID for this case
					tmpFormView.options.CustomTargetID = tmpFormView.options.DefaultDestinationAddress.replace(/#/, '');
					tmpFormDivTemplate += `\n{~T:${this.formTemplatePrefix}-Template-Form-Container-Custom:Pict.views["${tmpFormView.Hash}"]~}`;
				}
				tmpFormDivTemplate += `\n{~T:${this.formTemplatePrefix}-Template-Form-Container-Wrap-Postfix:Pict.views["${tmpFormView.Hash}"]~}`;
			}
			else if (!tmpFormView.isPictSectionForm)
			{
				//NOTE: For now, requiring the destination address to be an ID for this case
				tmpFormView.options.CustomTargetID = tmpFormView.options.DefaultDestinationAddress.replace(/#/, '');
				tmpFormDivTemplate += `\n{~T:${this.formTemplatePrefix}-Template-Form-Container-Wrap-Prefix:Pict.views["${tmpFormView.Hash}"]~}`;
				tmpFormDivTemplate += `\n{~T:${this.formTemplatePrefix}-Template-Form-Container-Custom:Pict.views["${tmpFormView.Hash}"]~}`;
				tmpFormDivTemplate += `\n{~T:${this.formTemplatePrefix}-Template-Form-Container-Wrap-Postfix:Pict.views["${tmpFormView.Hash}"]~}`;
			}
			const tmpFormDivContent = this.pict.parseTemplate(tmpFormDivTemplate, tmpFormView, null, [this]);
			if (tmpPrevDiv)
			{
				this.pict.ContentAssignment.insertContentAfter(`#${tmpPrevDiv.id}`, tmpFormDivContent);
				tmpFormDivs = this.pict.ContentAssignment.getElement(`#${tmpFormDivID}`);
				tmpPrevDiv = tmpFormDivs[0];
				continue;
			}
			tmpDeferredDivID = tmpFormDivID;
			tmpDeferredDivContent = tmpFormDivContent;
		}
		if (tmpDeferredDivID)
		{
			// this means the container was empty, so just add it to the end
			this.pict.ContentAssignment.appendContent(`#Pict-${this.UUID}-FormContainer`, tmpDeferredDivContent);
			tmpDeferredDivID = null;
			tmpDeferredDivContent = null;
		}
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

	getSectionViewFromHash(pSectionHash)
	{
		let tmpSectionHash = (typeof(pSectionHash) === 'string') ? pSectionHash : false;
		if (!tmpSectionHash)
		{
			this.log.error('getSectionViewFromHash() called without a valid section hash.');
			return false;
		}
		let tmpViewHash = `PictSectionForm-${tmpSectionHash}`;
		if (tmpViewHash in this.fable.views)
		{
			return this.fable.views[tmpViewHash];
		}
		this.log.error(`getSectionViewFromHash() could not find a view for section hash [${tmpSectionHash}].`);
		return false;
	}

	/**
	 * Bootstraps Pict DynamicForm views from a Manyfest description JSON object.
	 *
	 * @param {Object} pManifestDescription - The manifest description object.
	 * @param {string} [pAfterSectionHash] - The hash of the section to add after. Omit to add to the start.
	 *
	 * @returns {Array<Record<string, any>>} - An array of section definitions added.
	 */
	bootstrapPictFormViewsFromManifest(pManifestDescription, pAfterSectionHash)
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
		if (this.manifestDescription)
		{
			this.stashedManifestDescription = this.manifestDescription;
			this.manifestDescription = tmpManifestDescription;
			//FIXME: merge manifests more fully... should this be an external capability?
			for (const [ tmpKey, tmpDescriptor ] of Object.entries(this.manifestDescription.Descriptors || {}))
			{
				if (this.stashedManifestDescription.Descriptors[tmpKey])
				{
					this.log.error(`PictFormMetacontroller.bootstrapPictFormViewsFromManifest() found a duplicate descriptor key [${tmpKey}] when merging manifests. The new descriptor will be skipped.`);
					continue;
				}
				this.stashedManifestDescription.Descriptors[tmpKey] = JSON.parse(JSON.stringify(tmpDescriptor));
			}
			for (const tmpKey of Object.keys(this.manifestDescription.ReferenceManifests || {}))
			{
				if (this.stashedManifestDescription.ReferenceManifests[tmpKey])
				{
					this.log.warn(`PictFormMetacontroller.bootstrapPictFormViewsFromManifest() found a duplicate reference manifest key [${tmpKey}] when merging manifests. The new reference manifest will be skipped.`);
					continue;
				}
				this.stashedManifestDescription.ReferenceManifests[tmpKey] = JSON.parse(JSON.stringify(this.manifestDescription.ReferenceManifests[tmpKey]));
			}
			let tmpInsertAtIndex = this.stashedManifestDescription.Sections.findIndex((pSection) => pSection.Hash == pAfterSectionHash);
			if (tmpInsertAtIndex < 0)
			{
				tmpInsertAtIndex = 0;
			}
			else
			{
				// We want to insert AFTER the found index, so increment by 1
				++tmpInsertAtIndex;
			}
			for (const tmpSection of this.manifestDescription.Sections || [])
			{
				const tmpClonedSection = JSON.parse(JSON.stringify(tmpSection));
				this.stashedManifestDescription.Sections.splice(tmpInsertAtIndex, 0, tmpClonedSection);
				++tmpInsertAtIndex;
			}
		}
		else
		{
			this.manifestDescription = tmpManifestDescription;
		}
		let tmpManifest = this.fable.instantiateServiceProviderWithoutRegistration('Manifest', this.manifestDescription);

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
		if (('Sections' in this.manifestDescription) && Array.isArray(this.manifestDescription.Sections))
		{
			for (let i = 0; i < this.manifestDescription.Sections.length; i++)
			{
				let tmpSectionDefinition = this.getSectionDefinition(this.manifestDescription.Sections[i]);

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

			if (tmpDescriptor && tmpDescriptor.PictForm)
			{
				this.pict.manifest.addDescriptor(tmpDescriptorKeys[i], tmpDescriptor);
			}

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
			tmpViewConfiguration.Manifests.Section = this.manifestDescription;
			tmpViewConfiguration.AutoMarshalDataOnSolve = this.options.AutoMarshalDataOnSolve;
			this.pict.addView(tmpViewHash, tmpViewConfiguration, libPictViewDynamicForm);
		}

		if ('PickLists' in this.manifestDescription)
		{
			let tmpPickListKeys = Object.keys(this.manifestDescription.PickLists);
			for (let i = 0; i < tmpPickListKeys.length; i++)
			{
				let tmpPickList = this.manifestDescription.PickLists[tmpPickListKeys[i]];
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

		if (this.stashedManifestDescription)
		{
			this.manifestDescription = this.stashedManifestDescription;
			delete this.stashedManifestDescription;
		}
		return tmpSectionList;
	}

	/**
	 * Trigger an event on all inputs on all views.
	 * @param {string} pEvent - The event to trigger
	 * @param {string} [pTransactionGUID] - (optional) The transaction GUID to use for the event.
	 */
	triggerGlobalInputEvent(pEvent, pTransactionGUID)
	{
		const tmpTransactionGUID = (pTransactionGUID && typeof(pTransactionGUID) === 'string') ? pTransactionGUID : this.fable.getUUID();
		let tmpEvent = (typeof(pEvent) === 'string') ? pEvent : this.fable.getUUID();
		let tmpViewHashes = Object.keys(this.pict.views);
		let tmpCompletedHashes = {};
		/** @type {import('./Pict-View-DynamicForm.js')} */
		let tmpFinalizeView = null;
		// Filter the views based on the filter function and type
		for (let i = 0; i < tmpViewHashes.length; i++)
		{
			/** @type {import('./Pict-View-DynamicForm.js')} */
			let tmpView = this.pict.views[tmpViewHashes[i]];
			if (tmpView.isPictSectionForm)
			{
				tmpFinalizeView = tmpView;
				tmpView.sectionInputEvent(tmpEvent, tmpCompletedHashes, tmpTransactionGUID);
			}
		}
		if (pTransactionGUID !== tmpTransactionGUID && tmpFinalizeView)
		{
			// If we created the transaction GUID, we need to finalize it
			tmpFinalizeView.finalizeTransaction(tmpTransactionGUID);
		}
	}

	/**
	 * @param {string} pTransactionGUID - The transaction GUID.
	 * @param {string} pAsyncOperationHash - The hash of the async operation.
	 */
	registerEventTransactionAsyncOperation(pTransactionGUID, pAsyncOperationHash)
	{
		this.pict.TransactionTracking.pushToTransactionQueue(pTransactionGUID, pAsyncOperationHash, PENDING_ASYNC_OPERATION_TYPE);
	}

	/**
	 * @param {string} pTransactionGUID - The transaction GUID.
	 * @param {string} pAsyncOperationHash - The hash of the async operation.
	 *
	 * @return {boolean} - Returns true if the async operation was found and marked as complete, otherwise false.
	 */
	eventTransactionAsyncOperationComplete(pTransactionGUID, pAsyncOperationHash)
	{
		const tmpQueue = this.pict.TransactionTracking.checkTransactionQueue(pTransactionGUID);
		let tmpPendingAsyncOperationCount = 0;
		let tmpMarkedOperationCount = 0;
		let tmpFinalized = false;
		for (let i = 0; i < tmpQueue.length; i++)
		{
			const tmpQueueItem = tmpQueue[i];
			if (tmpQueueItem.Type === PENDING_ASYNC_OPERATION_TYPE)
			{
				if (tmpQueueItem.Data === pAsyncOperationHash)
				{
					tmpQueue.splice(i, 1);
					++tmpMarkedOperationCount;
					--i;
				}
				else
				{
					++tmpPendingAsyncOperationCount;
				}
			}
			if (tmpQueueItem.Type === READY_TO_FINALIZE_TYPE)
			{
				tmpFinalized = true;
			}
		}
		if (tmpPendingAsyncOperationCount === 0)
		{
			for (const tmpQueueItem of tmpQueue)
			{
				if (tmpQueueItem.Type === TRANSACTION_COMPLETE_CALLBACK_TYPE)
				{
					if (typeof tmpQueueItem.Data !== 'function')
					{
						this.log.error(`PICT View Metatemplate Helper eventTransactionAsyncOperationComplete transaction callback was not a function.`);
						continue;
					}
					try
					{
						tmpQueueItem.Data();
					}
					catch (pError)
					{
						this.log.error(`PICT View Metatemplate Helper eventTransactionAsyncOperationComplete transaction callback error: ${pError}`, { Stack: pError.stack });
					}
				}
			}
		}
		return tmpMarkedOperationCount > 0;
	}

	/**
	 * @param {string} pTransactionGUID - The transaction GUID.
	 *
	 * @return {boolean} - Returns true if the transaction was found and able to be finalized, otherwise false.
	 */
	finalizeTransaction(pTransactionGUID)
	{
		this.pict.TransactionTracking.pushToTransactionQueue(pTransactionGUID, null, READY_TO_FINALIZE_TYPE);

		const tmpQueue = this.pict.TransactionTracking.checkTransactionQueue(pTransactionGUID);
		let tmpPendingAsyncOperationCount = 0;
		for (const tmpQueueItem of tmpQueue)
		{
			if (tmpQueueItem.Type === PENDING_ASYNC_OPERATION_TYPE)
			{
				++tmpPendingAsyncOperationCount;
			}
		}
		if (tmpPendingAsyncOperationCount > 0)
		{
			this.pict.log.info(`PICT View Metatemplate Helper finalizeTransaction ${pTransactionGUID} is waiting on ${tmpPendingAsyncOperationCount} pending async operations.`);
			return false;
		}
		for (const tmpQueueItem of tmpQueue)
		{
			if (tmpQueueItem.Type === TRANSACTION_COMPLETE_CALLBACK_TYPE)
			{
				if (typeof tmpQueueItem.Data !== 'function')
				{
					this.log.error(`PICT View Metatemplate Helper eventTransactionAsyncOperationComplete transaction callback was not a function.`);
					continue;
				}
				try
				{
					tmpQueueItem.Data();
				}
				catch (pError)
				{
					this.log.error(`PICT View Metatemplate Helper eventTransactionAsyncOperationComplete transaction callback error: ${pError}`, { Stack: pError.stack });
				}
			}
		}
		//TODO: figure out how to safely clean up old transactions
		//delete this.pict.TransactionTracking.transactions[pTransactionGUID];
		return true;
	}

	/**
	 * @param {string} pTransactionGUID - The transaction GUID.
	 * @param {Function} fCallback - The callback to call when the transaction is complete.
	 */
	registerOnTransactionCompleteCallback(pTransactionGUID, fCallback)
	{
		const tmpQueue = this.pict.TransactionTracking.checkTransactionQueue(pTransactionGUID);
		let tmpFinalized = false;
		for (const tmpQueueItem of tmpQueue)
		{
			if (tmpQueueItem.Type === READY_TO_FINALIZE_TYPE)
			{
				tmpFinalized = true;
				break;
			}
		}
		if (tmpFinalized)
		{
			fCallback();
		}
		else
		{
			this.pict.TransactionTracking.pushToTransactionQueue(pTransactionGUID, fCallback, TRANSACTION_COMPLETE_CALLBACK_TYPE);
		}
	}

	showSupportViewInlineEditor()
	{
		// 1. See if the Support views are loaded
		// 2. Load the support view if it isn't
		this.pict.addViewSingleton("Pict-Form-DebugViewer", {}, this.SupportViewPrototypes.DebugViewer);
		this.pict.addViewSingleton("Pict-Form-AppDataViewer", {}, this.SupportViewPrototypes.AppDataViewer);
//		this.pict.addViewSingleton("Pict-Form-LifecycleVisualization", {}, this.SupportViewPrototypes.LifecycleVisualization);
		this.pict.addViewSingleton("Pict-Form-SolverVisualization", {}, this.SupportViewPrototypes.SolverVisualization);
//		this.pict.addViewSingleton("Pict-Form-SpecificSolveVisualization", {}, this.SupportViewPrototypes.SpecificSolveVisualization);
	
		// 3. See if the container for the support view is loaded
		// 4. Render the container for the support view if it isn't loaded
		this.pict.views["Pict-Form-DebugViewer"].bootstrapContainer();
	
		// 5. Render the support view into the container
		this.pict.views["Pict-Form-DebugViewer"].render();
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
