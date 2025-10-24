const libPictView = require(`pict-view`);

const libPictSupportProvider = require('./Pict-Provider-PSF-Support.js');

const defaultViewConfiguration = (
{
	ViewIdentifier: "Pict-Form-SupportBase",

	DefaultRenderable: 'Pict-Form-SUPPORT-BASE',

	RenderOnLoad: false,

	Templates: [],
	Renderables: [
		{
			RenderableHash: "Pict-Form-SUPPORT-BASE",
			TemplateHash: "Pict-Form-SUPPORT-BASE-NOTEMPLATE"
		}
	]
});

class PictFormsSupportBase extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		// Add the support provider if it doesn't exist
		this.pict.addProviderSingleton("Pict-Form-SupportExtensions", {}, libPictSupportProvider);

		this.DisplayShortName = 'U';
		this.DisplayLongName = 'UNDEFINED';

		// Register this with the support provider
		this.pict.providers["Pict-Form-SupportExtensions"].registerSupportView(this);
	}

	getDynamicState()
	{
		if (!('PictFormMetacontroller' in this.pict.views))
		{
			this.pict.log.warn(`Pict Forms Inline Editor tried to initialize but no metacontroller was found.`);
			return (
				{
					"Scope": `ERR_NO_METACONTROLLER`,
					"Description": `Error initializing inline editor -- no metacontroller found.`,
					"Manifest": this.fable.newManyfest(),
					"Sections": []
				});
		}
		let tmpMetacontroller = this.pict.views.PictFormMetacontroller;
		let tmpDynamicState = (
			{
				// TODO: The way the metacontroller pulls in the manifest and bootstraps the description is putting "DEFAULT" into the actual manifest; fix this.
				"Scope": tmpMetacontroller.manifestDescription.Scope,
				"Description": ``,
				"Manifest": tmpMetacontroller.manifest,
				"ManifestDescription": tmpMetacontroller.manifestDescription,
				"AllViews": tmpMetacontroller.filterViews(),
				"SectionViews": [],
				"DynamicInputView": false,
				"Solvers": []
			});

		for (let i = 0; i < tmpDynamicState.AllViews.length; i++)
		{
			let tmpSectionView = tmpDynamicState.AllViews[i];
			if (tmpSectionView.isPictSectionForm && (tmpSectionView.Hash == 'PictFormMetacontroller-DynamicInputs'))
			{
				// This is the special Dynamic Input section -- it goes in its own place.
				tmpDynamicState.DynamicInputView = tmpSectionView;
			}
			else if (tmpSectionView.isPictSectionForm)
			{
				tmpDynamicState.SectionViews.push(
					{
						View: tmpSectionView,
						sectionDefinition: tmpSectionView.sectionDefinition,
						Solvers: []
					});
			}
		}

		// Now get the solvers for each section view
		for (let i = 0; i < tmpDynamicState.SectionViews.length; i++)
		{
			let tmpSectionView = tmpDynamicState.SectionViews[i].View;
			let tmpSectionViewSolvers = tmpDynamicState.SectionViews[i].Solvers;
			// Find the view representation in the 
			if (tmpSectionView.isPictSectionForm && Array.isArray(tmpSectionView.sectionDefinition.Solvers))
			{
				for (let j = 0; j < tmpSectionView.sectionDefinition.Solvers.length; j++)
				{
					let tmpSolver = tmpSectionView.sectionDefinition.Solvers[j];

					let tmpSolverEntry = { ViewHash: tmpSectionView.Hash, SectionOrdinal: i, Ordinal: 1, Index: j, Expression: '', ExpressionType: 'Unknown', ExpressionScope: 'Section'}
					if (typeof(tmpSolver) === 'string')
					{
						tmpSolverEntry.Expression = tmpSolver;
						tmpSolverEntry.ExpressionType = 'Simple';
					}
					else if (typeof(tmpSolver) === 'object')
					{
						// When the solvers are in this format:
						// {
						// 	Ordinal: 0,
						// 	Expression: "PercentTotalFat = (Fat * 9) / Calories",
						// }
						tmpSolverEntry.Expression = tmpSolver.Expression;
						tmpSolverEntry.Ordinal = tmpSolver.Ordinal;
						tmpSolverEntry.ExpressionType = 'Complex';
					}
					tmpDynamicState.Solvers.push(tmpSolverEntry);
					tmpSectionViewSolvers.push(tmpSolverEntry);
				}
			}

			// Now get all the Group solvers
			// These guards are here because the metacontroller view masquerades as a section form view but isn't one.
			for (let j = 0; j < tmpSectionView.sectionDefinition.Groups.length; j++)
			{
				let tmpGroup = tmpSectionView.getGroup(j);
				if (`RecordSetSolvers` in tmpGroup)
				{
					for (let k = 0; k < tmpGroup.RecordSetSolvers.length; k++)
					{
						let tmpSolver = tmpGroup.RecordSetSolvers[k];
	
						let tmpSolverEntry = { ViewHash: tmpSectionView.Hash, SectionOrdinal: i, Ordinal: 1, Index: j, Expression: '', ExpressionType: 'Unknown', ExpressionScope: 'Group'}
						if (tmpSolver)
						{
							if (typeof(tmpSolver) === 'string')
							{
								tmpSolverEntry.Expression = tmpSolver;
								tmpSolverEntry.ExpressionType = 'Simple';
							}
							else if (typeof(tmpSolver) === 'object')
							{
								// When the solvers are in this format:
								// {
								// 	Ordinal: 0,
								// 	Expression: "PercentTotalFat = (Fat * 9) / Calories",
								// }
								tmpSolverEntry.Expression = tmpSolver.Expression;
								tmpSolverEntry.Ordinal = tmpSolver.Ordinal;
								tmpSolverEntry.ExpressionType = 'Complex';
							}
						}
						tmpDynamicState.Solvers.push(tmpSolverEntry);
						tmpSectionViewSolvers.push(tmpSolverEntry);
					}
				}
			}

			// Now sort the solvers by Ordinal, then Group/Section and then Index
			tmpSectionViewSolvers.sort((pLeftValue, pRightValue) => 
			{
				if (pLeftValue.Ordinal < pRightValue.Ordinal) return -1;
				if (pLeftValue.Ordinal > pRightValue.Ordinal) return 1;
				if (pLeftValue.ExpressionScope == 'Group' && pRightValue.ExpressionScope == 'Section') return -1;
				if (pLeftValue.ExpressionScope == 'Section' && pRightValue.ExpressionScope == 'Group') return 1;
				if (pLeftValue.Index < pRightValue.Index) return -1;
				if (pLeftValue.Index > pRightValue.Index) return 1;
				return 0;
			});
		}

		tmpDynamicState.Solvers.sort((pLeftValue, pRightValue) => 
			{
				if (pLeftValue.Ordinal < pRightValue.Ordinal) return -1;
				if (pLeftValue.Ordinal > pRightValue.Ordinal) return 1;
				if (pLeftValue.ExpressionScope == 'Group' && pRightValue.ExpressionScope == 'Section') return -1;
				if (pLeftValue.ExpressionScope == 'Section' && pRightValue.ExpressionScope == 'Group') return 1;
				if (pLeftValue.Index < pRightValue.Index) return -1;
				if (pLeftValue.Index > pRightValue.Index) return 1;
				return 0;
			});
		// Get the *full* last solve outcome object
		tmpDynamicState.LastSolveOutcome = this.pict.providers.DynamicSolver.lastSolveOutcome;

		// Now walk through the solvers and see if the outcome has a result for it.
		if (typeof(tmpDynamicState.LastSolveOutcome) == 'object')
		{
			for (let i = 0; i < tmpDynamicState.Solvers.length; i++)
			{
				let tmpSolverEntry = tmpDynamicState.Solvers[i];

				if (tmpSolverEntry.Ordinal in tmpDynamicState.LastSolveOutcome.SolveOrdinals)
				{
					if (tmpSolverEntry.ExpressionScope == 'Section')
					{
						let tmpSolveResultSet = tmpDynamicState.LastSolveOutcome.SolveOrdinals[tmpSolverEntry.Ordinal].SectionSolvers;
						if (Array.isArray(tmpSolveResultSet))
						{
							for (let j = 0; j < tmpSolveResultSet.length; j++)
							{
								let tmpPotentialResultEntry =	tmpSolveResultSet[j];
								if ((tmpPotentialResultEntry.ViewHash == tmpSolverEntry.ViewHash) && (tmpPotentialResultEntry.Solver.Expression == tmpSolverEntry.Expression))
								{
									// We have a match -- assign the result to the solver entry
									tmpSolverEntry.LastResult = tmpPotentialResultEntry.Solver.ResultsObject.RawResult;
									tmpSolverEntry.Value = tmpPotentialResultEntry.Solver.ResultsObject.RawResult;
									tmpSolverEntry.LastResultsObject = tmpPotentialResultEntry.Solver.ResultsObject;
								}
							}
						}
					}
					else if ((tmpSolverEntry.ExpressionScope == 'Group'))
					{
						let tmpSolveResultSet = tmpDynamicState.LastSolveOutcome.SolveOrdinals[tmpSolverEntry.Ordinal].GroupSolvers;
						if (Array.isArray(tmpSolveResultSet))
						{
							for (let j = 0; j < tmpSolveResultSet.length; j++)
							{
								let tmpPotentialResultEntry =	tmpSolveResultSet[j];
								if ((tmpPotentialResultEntry.ViewHash == tmpSolverEntry.ViewHash) && (tmpPotentialResultEntry.Solver.Expression == tmpSolverEntry.Expression))
								{
									// We have a match -- assign the result to the solver entry
									if (tmpPotentialResultEntry.Solver && ('ResultsObject' in tmpPotentialResultEntry.Solver))
									{
										tmpSolverEntry.LastResult = tmpPotentialResultEntry.Solver.ResultsObject.RawResult;
									}
									if (tmpPotentialResultEntry.Solver && ('ResultsObject' in tmpPotentialResultEntry.Solver))
									{
										tmpSolverEntry.LastResultsObject = tmpPotentialResultEntry.Solver.ResultsObject;
									}
								}
							}
						}
					}
				}
			}
		}

		return tmpDynamicState;
	}

	getSectionSolvers(pSectionViewHash)
	{
		let tmpDynamicState = this.getDynamicState();
		let tmpSectionSolvers = tmpDynamicState.Solvers.map((pSolverEntry) => { if (pSolverEntry.ViewHash === pSectionViewHash) return pSolverEntry; });
		return tmpSectionSolvers;
	}


	downloadJSONObjectAsFile(pAddress)
	{
		try
		{
			const tmpJSONData = this.pict.resolveStateFromAddress(pAddress);
			const tmpJSONFileName = `PICT_JSON_${pAddress.replace('.','_')}.json`;
			const tmpJSONString = JSON.stringify(tmpJSONData, null, 4);

			if (!URL || !Blob)
			{
				this.pict.log.error(`Browser does not support required features for downloading JSON object from address ${pAddress}.`);
				return;
			}

			// Synthesize a file, URL and link to facilitate a file download
			const tmpAbstractFileBlob = new Blob([tmpJSONString], { type: "application/json" });
			const tmpAbstractFileURL = URL.createObjectURL(tmpAbstractFileBlob);
			const tmpAbstractAnchorElement = document.createElement("a");
			tmpAbstractAnchorElement.href = tmpAbstractFileURL;
			tmpAbstractAnchorElement.download = tmpJSONFileName;
			// Trigger the download
			tmpAbstractAnchorElement.click();
			// Clean up the URL from memory
			URL.revokeObjectURL(tmpAbstractFileURL);
		}
		catch (pError)
		{
			this.pict.log.error(`Error downloading JSON object from address ${pAddress}: ${pError.message}`);
		}
	}

	updateExpressionFromElement(pExpressionElementAddress, pExpressionScope, pSectionViewHash, pSectionOrdinal, pSolverIndex, pExpressionElementRepresentationAddress)
	{
		// 1. Get the expression from the element
		let tmpExpressionElementValue = this.pict.ContentAssignment.readContent(pExpressionElementAddress);

		if (!tmpExpressionElementValue)
		{
			this.pict.log.warn(`No expression found in element at address ${pExpressionElementAddress}; cannot update ${pExpressionScope} solver Ordinal ${pSectionOrdinal} Index ${pSolverIndex}.`);
			return;
		}
		// 2. Go through the enumeration of solvers to find if this expression exists
		let tmpMetacontroller = this.pict.views.PictFormMetacontroller;
		let tmpDynamicState = (
			{
				// TODO: The way the metacontroller pulls in the manifest and bootstraps the description is putting "DEFAULT" into the actual manifest; fix this.
				"Scope": tmpMetacontroller.manifestDescription.Scope,
				"Description": ``,
				"Manifest": tmpMetacontroller.manifest,
				"ManifestDescription": tmpMetacontroller.manifestDescription,
				"AllViews": tmpMetacontroller.filterViews(),
				"SectionViews": [],
				"DynamicInputView": false,
				"Solvers": []
			});

		for (let i = 0; i < tmpDynamicState.AllViews.length; i++)
		{
			let tmpSectionView = tmpDynamicState.AllViews[i];
			if (tmpSectionView.isPictSectionForm && (tmpSectionView.Hash == 'PictFormMetacontroller-DynamicInputs'))
			{
				// This is the special Dynamic Input section -- it goes in its own place.
				tmpDynamicState.DynamicInputView = tmpSectionView;
			}
			else if (tmpSectionView.isPictSectionForm)
			{
				tmpDynamicState.SectionViews.push(
					{
						View: tmpSectionView,
						sectionDefinition: tmpSectionView.sectionDefinition,
						Solvers: []
					});
			}
		}

		// Now get the solvers for each section view
		for (let i = 0; i < tmpDynamicState.SectionViews.length; i++)
		{
			let tmpSectionView = tmpDynamicState.SectionViews[i].View;
			let tmpSectionViewSolvers = tmpDynamicState.SectionViews[i].Solvers;
			// Find the view representation in the 
			if (tmpSectionView.isPictSectionForm && Array.isArray(tmpSectionView.sectionDefinition.Solvers))
			{
				for (let j = 0; j < tmpSectionView.sectionDefinition.Solvers.length; j++)
				{
					let tmpSolver = tmpSectionView.sectionDefinition.Solvers[j];

					// 3a. Update the expression in the solver definition
					if (pExpressionScope == 'Section' && i == pSectionOrdinal && j == pSolverIndex && tmpSectionView.Hash == pSectionViewHash)
					{
						// This is the solver we are updating
						if (typeof(tmpSolver) === 'string')
						{
							// Simple solver -- just a string
							tmpSectionView.sectionDefinition.Solvers[j] = tmpExpressionElementValue;
						}
						else if (typeof(tmpSolver) === 'object')
						{
							// Complex solver -- update the expression property
							tmpSectionView.sectionDefinition.Solvers[j].Expression = tmpExpressionElementValue;
						}
					}
				}
			}

			// Now get all the Group solvers
			// These guards are here because the metacontroller view masquerades as a section form view but isn't one.
			for (let j = 0; j < tmpSectionView.sectionDefinition.Groups.length; j++)
			{
				let tmpGroup = tmpSectionView.getGroup(j);
				if (`RecordSetSolvers` in tmpGroup)
				{
					for (let k = 0; k < tmpGroup.RecordSetSolvers.length; k++)
					{
						let tmpSolver = tmpGroup.RecordSetSolvers[k];
	
						// 3b. Update the expression in the solver definition
						if (pExpressionScope == 'Group' && i == pSectionOrdinal && j == pSolverIndex && tmpSectionView.Hash == pSectionViewHash)
						{
							// This is the solver we are updating
							if (typeof(tmpSolver) === 'string')
							{
								// Simple solver -- just a string
								tmpSectionView.sectionDefinition.Solvers[j] = tmpExpressionElementValue;
							}
							else if (typeof(tmpSolver) === 'object')
							{
								// Complex solver -- update the expression property
								tmpSectionView.sectionDefinition.Solvers[j].Expression = tmpExpressionElementValue;
							}
						}
					}
				}
			}
		}

		// 4. Write the updated expression to it's representation element, if provided
		if (pExpressionElementRepresentationAddress)
		{
			this.pict.ContentAssignment.assignContent(pExpressionElementRepresentationAddress, tmpExpressionElementValue);
		}
	}

	bootstrapContainer()
	{
		// 3. See if the container for the support view is loaded
		let tmpContainerTest = this.options.DefaultDestinationAddress;

		let tmpContainerElement = this.pict.ContentAssignment.getElement(this.options.DefaultDestinationAddress);
		if (tmpContainerElement.length > 0)
		{
			return true;
		}

		// 4. Render the container for the support view if it isn't loaded
		let tmpContainerRenderableHash = 'Pict-Form-Support-Container';

		// Check if the renderable exists -- if not, create it dynamically
		// This just appends itself to the body once, and creates a simple container for extensions to load into.
		if (!(tmpContainerRenderableHash in this.renderables))
		{
			this.renderables[tmpContainerRenderableHash] = (
				{
					RenderableHash: "Pict-Form-Support-Container",
					TemplateHash: "Pict-Form-Support-Container",
					ContentDestinationAddress: 'body',
					RenderMethod: 'append_once',
					TestAddress: "#Pict-Form-Extensions-Container",
				});
		}

		this.renderables[tmpContainerRenderableHash].TestAddress = tmpContainerTest;
		this.pict.CSSMap.injectCSS();

		this.render(tmpContainerRenderableHash);

		// 5. Make the container draggable
		// Setup the draggable behavior for the window
		let tmpDraggableElement = document.getElementById('Pict-Form-Extensions-Wrap'); // What we are dragging
		let tmpDragInteractiveControl = document.getElementById('Pict-Form-Extension-DragControl'); // The control you click on to drag
		if (tmpDraggableElement && tmpDragInteractiveControl)
		{
			tmpDragInteractiveControl.addEventListener('mousedown',
				/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
				* BEGIN of browser event code block
				*
				* The below code is meant to run in response to a browser event.
				* --> Therefore the "this" context is the element that fired the event.
				* --> Happy trails.
				*/
				function (pEvent)
				{
					let tmpOffsetX = pEvent.offsetX + tmpDragInteractiveControl.clientLeft;
					let tmpOffsetY = pEvent.offsetY + tmpDragInteractiveControl.clientTop;
					function dragHandler(pEvent)
					{
						pEvent.stopPropagation();
						
						tmpDraggableElement.style.left = (pEvent.clientX - tmpOffsetX) + 'px';
						tmpDraggableElement.style.top = (pEvent.clientY - tmpOffsetY) + 'px';
					}
					function dragStop(pEvent)
					{
						window.removeEventListener('pointermove', dragHandler);
						window.removeEventListener('pointerup', dragStop);
					}
					window.addEventListener('pointermove', dragHandler);
					window.addEventListener('pointerup', dragStop);

					// Prevent janky selection behaviors in the browser
					pEvent.preventDefault();
				});
				/*
				* END of browser event code block
				* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
		}

		// 6. Make the container resizable
		// Setup the draggable behavior for the window
		let tmpResizableElement = document.getElementById('Pict-Form-Extensions-Wrap'); // What we are resizing
		let tmpResizableControl = document.getElementById('Pict-Form-Extension-ResizeControl'); // The control you click on to drag
		if (tmpResizableElement && tmpResizableControl)
		{
			tmpResizableControl.addEventListener('mousedown',
				/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
				* BEGIN of browser event code block
				*
				* The below code is meant to run in response to a browser event.
				* --> Therefore the "this" context is the element that fired the event.
				* --> Happy trails.
				*/
				function (pEvent)
				{
					function dragResizeHandler(pEvent)
					{
						pEvent.stopPropagation();
						
						let tmpNewWidth = pEvent.clientX - tmpResizableElement.getBoundingClientRect().left;
						let tmpNewHeight = pEvent.clientY - tmpResizableElement.getBoundingClientRect().top;

						// Check the CSS for minimum width and height, and set these to those if we go under
						let tmpComputedStyle = getComputedStyle(tmpResizableElement);
						let tmpMinWidth = parseInt(tmpComputedStyle.minWidth, 10);
						let tmpMinHeight = parseInt(tmpComputedStyle.minHeight, 10);

						if (tmpNewWidth < tmpMinWidth)
						{
							tmpNewWidth = tmpMinWidth;
						}
						if (tmpNewHeight < tmpMinHeight)
						{
							tmpNewHeight = tmpMinHeight;
						}
						tmpResizableElement.style.width = tmpNewWidth + 'px';
						tmpResizableElement.style.height = tmpNewHeight + 'px';
					}
					function dragResizeStop(pEvent)
					{
						window.removeEventListener('pointermove', dragResizeHandler);
						window.removeEventListener('pointerup', dragResizeStop);
					}
					window.addEventListener('pointermove', dragResizeHandler);
					window.addEventListener('pointerup', dragResizeStop);

					// Prevent janky selection behaviors in the browser
					pEvent.preventDefault();
				});
				/*
				* END of browser event code block
				* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
		}

	}
}

module.exports = PictFormsSupportBase;

module.exports.default_configuration = defaultViewConfiguration;
