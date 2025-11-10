const libPictViewFormSupportBase = require(`./Pict-View-PSF-SupportBase.js`);

const defaultViewConfiguration = (
{
	ViewIdentifier: "Pict-Form-DebugViewer",

	DefaultRenderable: 'Pict-Form-DebugViewer-Renderable',
	DefaultDestinationAddress: "#Pict-Form-Extensions-Container",

	RenderOnLoad: false,

	CSS: /*css*/`
	/** Dynamic Input Section Overrides */
	#PSFExt-DynamicInputSection .PSFExt-Section { 
		margin: var(--PSFExt-gutter-size);
		padding: var(--PSFExt-gutter-size);
		background-color: var(--PSFExt-Section-DynamicInput-background-color);
	}

	#PSFExt-DynamicInputSection .PSFExt-Section .PSFExt-Section-Button { 
		background-color: var(--PSFExt-Section-DynamicInput-button-color);
	}
	#PSFExt-DynamicInputSection .PSFExt-Section .PSFExt-Section-Button a { 
		color: var(--PSFExt-Section-DynamicInput-button-text-color);
	}
	#PSFExt-DynamicInputSection .PSFExt-Section .PSFExt-Label,
	#PSFExt-DynamicInputSection .PSFExt-Section .PSFExt-DeEmphasize { 
		color: var(--PSFExt-Section-DynamicInput-button-color);
	}
	#PSFExt-DynamicInputSection .PSFExt-Section-Descriptors { 
		border-left: 5px solid var(--PSFExt-Section-DynamicInput-background-color);
	}
	#PSFExt-DynamicInputSection .PSFExt-Section-Group { 
		border-left: 5px solid var(--PSFExt-Section-DynamicInput-button-color);
	}
`,

	Templates: [
		{
			Hash: "Pict-Form-DebugViewer-Content",
			Template: /*html*/`
<div id="Pict-Form-DebugViewer-Content">
	<h2 class="PSFExt-Global-Header">Pict Inline Form Editing Tool</h2>
	{~T:Pict-Form-DebugViewer-MetacontrollerContainer~}
</div>`
		},
		{
			Hash: "Pict-Form-DebugViewer-MetacontrollerContainer",
			Template: /*html*/`
	<p class="PSFExt-Data"><span class="PSFExt-Label">Scope:</span> {~D:Context[0].getDynamicState().Scope~}</p>
	<ul class="PSFExt-Section-Buttons">
	</ul>
	<div id="PSFExt-SectionList">
		{~TS:Pict-Form-DebugViewer-SectionContainer:Context[0].getDynamicState().SectionViews~}
	</div>
	<hr>
	<div id="PSFExt-DynamicInputSection">
		{~T:Pict-Form-DebugViewer-SectionContainer:Context[0].getDynamicState().DynamicInputView~}
	</div>
`
		},
		{
			Hash: "Pict-Form-DebugViewer-SectionContainer",
			Template: /*html*/`
	<div id="PSFExt-Section-{~D:Record.Hash~}" class="PSFExt-Section">
		<h3 class="PSFExt-Section-Header"><span class="PSFExt-DeEmphasize">Section:</span> {~D:Record.sectionDefinition.Name~}</h3>
		<ul class="PSFExt-Section-Buttons">
			<li class="PSFExt-Section-Button"><a href="javascript:void(0);" onclick="{~P~}.views['{~D:Record.View.Hash~}'].render()">Render</a></li>
			<li class="PSFExt-Section-Button"><a href="javascript:void(0);" onclick="{~P~}.ContentAssignment.assignContent('{~D:Record.View.options.DefaultDestinationAddress~}','')">Clear</a></li>
			<li class="PSFExt-Section-Button"><a href="javascript:void(0);" onclick="{~P~}.ContentAssignment.removeClass('#PSFExt-{~D:Record.View.Hash~}-Extra', 'PSFExt-Hidden')">Extra Data</a></li>
		</ul>
		<div id="PSFExt-{~D:Record.View.Hash~}-Extra" class="PSFExt-Hidden PSFExt-Section-ExtraData">
			<p class="PSFExt-Data">
				<span class="PSFExt-Label">Description</span> {~D:Record.sectionDefinition.Description~}
			</p>
			<p class="PSFExt-Data">
				<span class="PSFExt-Label">Hash</span> {~D:Record.View.Hash~}
			</p>
			<p class="PSFExt-Data">
				<span class="PSFExt-Label">HTML ID</span> {~D:Record.View.sectionDefinition.Macro.HTMLID~}
			</p>
			<h4 class="PSFExt-Content-Header">Section Solvers:</h4>
			<div class="PSFExt-Section-Solvers">{~TS:Pict-Form-DebugViewer-SolverEntry:Record.Solvers[]<<~?ExpressionScope,==,Section?~>>~}</div>
			<h4 class="PSFExt-Content-Header">Tabular/RecordSet Solvers:</h4>
			<div class="PSFExt-Group-Solvers">{~TS:Pict-Form-DebugViewer-SolverEntry:Record.Solvers[]<<~?ExpressionScope,==,Group?~>>~}</div>
			<h4 class="PSFExt-Content-Header">Inputs:</h4>
			<div class="PSFExt-Section-Solver-DynamicInput">
				{~TS:Pict-Form-DebugViewer-GroupContainer:Record.View.sectionDefinition.Groups~}
			</div>
			<ul class="PSFExt-Section-Buttons">
				<li class="PSFExt-Section-Button"><a href="javascript:void(0);" onclick="{~P~}.ContentAssignment.addClass('#PSFExt-{~D:Record.View.Hash~}-Extra', 'PSFExt-Hidden')">Hide Extra Data for {~D:Record.View.Hash~}</a></li>
			</ul>
		</div>
	</div>
`
		},
		{
			Hash: "Pict-Form-DebugViewer-SolverEntry",
			Template: /*html*/`
			<div class="PSFExt-Section-Solver-Entry">
				<p class="PSFExt-Solver-Entry">{~D:Record.Expression~}</p>
				<p class="PSFExt-Data"><span class="PSFExt-Label">Last Result</span> <span class="PSFExt-Solver-Result">{~D:Record.LastResult~}</span></p>
				<p class="PSFExt-Data"><span class="PSFExt-Label">Sequence</span> Ordinal [{~D:Record.Ordinal~}] Index [{~D:Record.Index~}]</p>
			</div>
			`
		},
		{
			Hash: "Pict-Form-DebugViewer-GroupContainer",
			Template: /*html*/`
			<div class="PSFExt-Section-Group">
				<h5 class="PSFExt-Content-Header PSFExt-Section-Group-Header">
					<span class="PSFExt-DeEmphasize">Group:</span> {~D:Record.Name~} [idx <em>{~D:Record.GroupIndex~}</em>]
				</h5>
				<p class="PSFExt-Data"><span class="PSFExt-Label">Layout</span> {~D:Record.Layout~}</p>
				<div class="PSFExt-Section-Rows">
					{~TS:Pict-Form-DebugViewer-RowContainer:Record.Rows~}
				</div>
			</div>
			`
		},
		{
			Hash: "Pict-Form-DebugViewer-RowContainer",
			Template: /*html*/`
					<div class="PSFExt-Section-Descriptors">
						<h6 class="PSFExt-Content-Header PSFExt-Section-Group-Row-Header">
							<span class="PSFExt-DeEmphasize">Row:</span> {~D:Record.Hash~}
						</h6>
						{~TS:Pict-Form-DebugViewer-DescriptorContainer:Record.Inputs~}
					</div>
`
		},
		{
			Hash: "Pict-Form-DebugViewer-DescriptorContainer",
			Template: /*html*/`
						<div class="PSFExt-Section-Descriptor">
							<p class="PSFExt-Data-Header"><span class="PSFExt-DeEmphasize">Input:</span> {~D:Record.Name~}</p>
							<p class="PSFExt-Data"><span class="PSFExt-Label">Hash</span> {~D:Record.Hash~}</p>
							<p class="PSFExt-Data"><span class="PSFExt-Label">DataType</span> {~D:Record.DataType~}</p>
							<p class="PSFExt-Data"><span class="PSFExt-Label">InputType</span> {~D:Record.PictForm.InputType~}</p>
							<p class="PSFExt-Data"><span class="PSFExt-Label">Informary Data Address</span> {~D:Record.PictForm.InformaryDataAddress~}</p>
							<p class="PSFExt-Data"><span class="PSFExt-Label">Input Index</span> {~D:Record.PictForm.InputIndex~}</p>
							<p class="PSFExt-Data"><span class="PSFExt-Label">HTML ID</span> {~D:Record.PictForm.Macro.HTMLID~}</p>
						</div>
					`
		}
	],
	Renderables: [
		{
			RenderableHash: "Pict-Form-DebugViewer-Renderable",
			TemplateHash: "Pict-Form-DebugViewer-Content"
		}
	]
});

class PictFormsInlineEditor extends libPictViewFormSupportBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.DisplayShortName = 'IE';
		this.DisplayLongName = 'InlineEditor';
	}
}

module.exports = PictFormsInlineEditor;

module.exports.default_configuration = defaultViewConfiguration;
