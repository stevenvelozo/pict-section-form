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
		let tmpContainerRenderableHash = 'Pict-Form-DebugViewer-Container';
		this.renderables[tmpContainerRenderableHash].TestAddress = tmpContainerTest;
		this.pict.CSSMap.injectCSS();
		this.render(tmpContainerRenderableHash);
	}
}

module.exports = PictFormsSupportBase;

module.exports.default_configuration = defaultViewConfiguration;
