const libPictView = require(`pict-view`);

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

		// Only add this css if it doesn't exist
		if (!('Pict-Support' in this.pict.CSSMap.inlineCSSMap))
		{
			this.pict.CSSMap.addCSS('Pict-Support',
				/*css*/`
					:root{
						--PSF-Global-background-color: #dcdce5;
						--PSF-Global-text-color: #333333;
					}
					#Pict-Form-Extensions-Wrap {
						position: absolute;
						left: 50%;
						top: 0px;
						width: 50vw;
						max-height: 75vh;
						overflow: auto;
					}
					#Pict-Form-Extension-DragControl {
						background-color: #eae;
						cursor: move;
						padding: 2px 4px;
						border-radius: 3px;
					}
					#Pict-Form-Extensions-Container { 
						color: var(--PSF-Global-text-color);
						background-color: var(--PSF-Global-background-color);
						padding: 10px;
						border: 4px double #111;
						border-radius: 8px;
						box-shadow: 2px 2px 10px rgba(0,0,0,0.5);
						font-size: 14px;
						font-family: Arial, sans-serif;
						font-size: 14px;
					}
				`, 1000, 'Pict-Form-SupportBase');
		}
		// Only add this template if it doesn't exist
		if (this.pict.TemplateProvider.getTemplate('Pict-Form-Support-Container') == null)
		{
			this.pict.TemplateProvider.addTemplate('Pict-Form-Support-Container',
				/*html*/`
			<div id="Pict-Form-Extensions-Wrap">
				<p class="PSFDV-Extension-Header"><span id="Pict-Form-Extension-DragControl" class="PSDV-Extension-Header-Controlbar">Pict.Extensions <a href="javascript:void(0);" onclick="{~P~}.views.PictFormMetacontroller.showSupportViewInlineEditor()">reload</a> <a href="javascript:void(0);" onclick="{~P~}.ContentAssignment.toggleClass('#Pict-Form-Extensions-Container', 'PSFDV-Hidden')">toggle</a></span></p>
				<div id="Pict-Form-Extensions-Container"></div>
			</div>
				`);
		}
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

			// Now sort the solvers by Ordinal and then Index
			tmpSectionViewSolvers.sort((pLeftValue, pRightValue) => 
			{
				if (pLeftValue.Ordinal < pRightValue.Ordinal) return -1;
				if (pLeftValue.Ordinal > pRightValue.Ordinal) return 1;
				if (pLeftValue.Index < pRightValue.Index) return -1;
				if (pLeftValue.Index > pRightValue.Index) return 1;
				return 0;
			});
		}

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
									tmpSolverEntry.LastResultsObject = tmpPotentialResultEntry.ResultsObject;
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
									tmpSolverEntry.LastResult = tmpPotentialResultEntry.Solver.ResultsObject.RawResult;
									tmpSolverEntry.LastResultsObject = tmpPotentialResultEntry.Solver.ResultsObject;
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

	writeSolver(pIdentifierHash, pSolver)
	{

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

	}
}

module.exports = PictFormsSupportBase;

module.exports.default_configuration = defaultViewConfiguration;
