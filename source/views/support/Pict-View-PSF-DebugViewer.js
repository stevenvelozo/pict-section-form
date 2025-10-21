const libPictViewFormSupportBase = require(`./Pict-View-PSF-SupportBase.js`);

const defaultViewConfiguration = (
{
	ViewIdentifier: "Pict-Form-DebugViewer",

	DefaultRenderable: 'Pict-Form-DebugViewer-Renderable',
	DefaultDestinationAddress: "#Pict-Form-Extensions-Container",

	RenderOnLoad: false,

	CSS: /*css*/`
	:root{
		--PSFDV-gutter-size: 5px;
		--PSFDV-indentation-size: calc(2 * var(--PSFDV-gutter-size));
		--PSFDV-Global-background-color: #dcdce5;
		--PSFDV-Global-text-color: #333333;
		--PSFDV-Section-background-color: #cacae8;
		--PSFDV-Section-button-color: #5A52A3;
		--PSFDV-Section-button-text-color: #D8D7E5;
		--PSFDV-Section-Data-background-color: #e2e2f0;
		--PSFDV-Section-DynamicInput-background-color: #a3ccd8;
		--PSFDV-Section-DynamicInput-button-color: #2b89a4;
		--PSFDV-Section-DynamicInput-button-text-color: #D8D7E5;
	}
	.PSFDV-Extension-Header {
		font-size: 10px;
		font-weight: bold;
		margin-bottom: var(--PSFDV-gutter-size);
	}
	.PSFDV-Global-Header {
		margin: var(--PSFDV-gutter-size);
	}
	.PSFDV-Section-Header {
		margin: var(--PSFDV-gutter-size);
	}
	.PSFDV-Content-Header {
		margin: var(--PSFDV-gutter-size);
	}
	#PSFDV-SectionList .PSFDV-Section { 
		margin: var(--PSFDV-gutter-size);
		padding: var(--PSFDV-gutter-size);
		background-color: var(--PSFDV-Section-background-color);
	}
	.PSFDV-Section-Descriptors { 
		border-left: 5px solid var(--PSFDV-Section-background-color);
		background-color: #ffffff;
		padding: var(--PSFDV-gutter-size) 0;
	}
	.PSFDV-Section-Group { 
		border-left: 5px solid var(--PSFDV-Section-button-color);
		padding: var(--PSFDV-gutter-size);
		background-color: #efefef;
	}
	.PSFDV-Section-Buttons {
		list-style-type: none;
		padding: 0;
		margin: calc(var(--PSFDV-gutter-size) * 2) var(--PSFDV-gutter-size);
	}
	.PSFDV-Section-Button { 
		display: inline;
		margin-right: calc(var(--PSFDV-gutter-size) * 0.25);
		text-decoration: none;
		background-color: var(--PSFDV-Section-button-color);
		padding: var(--PSFDV-gutter-size);
		border-radius: var(--PSFDV-gutter-size);
	}
	.PSFDV-Section-Button a { 
		text-decoration: none;
		color: var(--PSFDV-Section-button-text-color);
	}
	.PSFDV-Section-Button a:hover { 
		text-decoration: underline;
	}
	.PSFDV-Solver-Entry { 
		padding-left: var(--PSFDV-indentation-size);
		margin-left: var(--PSFDV-gutter-size);
		font-family: "Courier New", "Lucida Console", monospace;
		white-space: nowrap;
		overflow: scroll;
	}
	.PSFDV-Solver-Result { 
		font-family: "Courier New", "Lucida Console", monospace;
		background-color: #dedede;
		border: 1px solid #cccccc;
		font-weight: bold;
		border-radius: var(--PSFDV-gutter-size);
		margin-top: var(--PSFDV-gutter-size);
		display: inline-block;
		white-space: nowrap;
		overflow: scroll;
		padding: var(--PSFDV-gutter-size);
	}
	.PSFDV-DataHeader {
		font-weight: bold;
		background-color: #f0f0f0;
		padding: var(--PSFDV-gutter-size);
	}
	.PSFDV-Section-ExtraData {
		margin-top: var(--PSFDV-gutter-size);
		padding: var(--PSFDV-gutter-size);
		background-color: var(--PSFDV-Section-Data-background-color);
	}
	.PSFDV-Section .PSFDV-DeEmphasize
	{
		color: var(--PSFDV-Section-button-color);
	}
	.PSFDV-DeEmphasize { 
		font-weight: light;
		font-size: smaller;
		display: block;
	}
	.PSFDV-Data { 
		margin-left: var(--PSFDV-indentation-size);
		line-height: 0.85;
		font-size: smaller;
	}
	.PSFDV-Label { 
		font-weight: light;
		min-width: 15%;
		display: block;
		color: var(--PSFDV-Section-button-color);
		margin: var(--PSFDV-gutter-size) 0;
	}
	.PSFDV-Hidden { 
		display: none;
	}
	.PSFDV-Section-Solver-DynamicInput {
		background-color: #ffffff;
	}
	#PSFDV-DynamicInputSection .PSFDV-Section { 
		margin: var(--PSFDV-gutter-size);
		padding: var(--PSFDV-gutter-size);
		background-color: var(--PSFDV-Section-DynamicInput-background-color);
	}

	#PSFDV-DynamicInputSection .PSFDV-Section .PSFDV-Section-Button { 
		background-color: var(--PSFDV-Section-DynamicInput-button-color);
	}
	#PSFDV-DynamicInputSection .PSFDV-Section .PSFDV-Section-Button a { 
		color: var(--PSFDV-Section-DynamicInput-button-text-color);
	}
	#PSFDV-DynamicInputSection .PSFDV-Section .PSFDV-Label,
	#PSFDV-DynamicInputSection .PSFDV-Section .PSFDV-DeEmphasize { 
		color: var(--PSFDV-Section-DynamicInput-button-color);
	}
	#PSFDV-DynamicInputSection .PSFDV-Section-Descriptors { 
		border-left: 5px solid var(--PSFDV-Section-DynamicInput-background-color);
	}
	#PSFDV-DynamicInputSection .PSFDV-Section-Group { 
		border-left: 5px solid var(--PSFDV-Section-DynamicInput-button-color);
	}
`,

	Templates: [
		{
			Hash: "Pict-Form-DebugViewer-Content",
			Template: /*html*/`
<div id="Pict-Form-DebugViewer-Content">
	<h2 class="PSFDV-Global-Header">Pict Inline Form Editing Tool</h2>
	{~T:Pict-Form-DebugViewer-MetacontrollerContainer~}
</div>`
		},
		{
			Hash: "Pict-Form-DebugViewer-MetacontrollerContainer",
			Template: /*html*/`
	<p class="PSFDV-Data"><span class="PSFDV-Label">Scope:</span> {~D:Context[0].getDynamicState().Scope~}</p>
	<div id="PSFDV-SectionList">
		{~TS:Pict-Form-DebugViewer-SectionContainer:Context[0].getDynamicState().SectionViews~}
	</div>
	<hr>
	<div id="PSFDV-DynamicInputSection">
		{~T:Pict-Form-DebugViewer-SectionContainer:Context[0].getDynamicState().DynamicInputView~}
	</div>
`
		},
		{
			Hash: "Pict-Form-DebugViewer-SectionContainer",
			Template: /*html*/`
	<div id="PSFDV-Section-{~D:Record.Hash~}" class="PSFDV-Section">
		<h3 class="PSFDV-Section-Header"><span class="PSFDV-DeEmphasize">Section:</span> {~D:Record.sectionDefinition.Name~}</h3>
		<ul class="PSFDV-Section-Buttons">
			<li class="PSFDV-Section-Button"><a href="javascript:void(0);" onclick="{~P~}.views['{~D:Record.View.Hash~}'].render()">Render</a></li>
			<li class="PSFDV-Section-Button"><a href="javascript:void(0);" onclick="{~P~}.ContentAssignment.assignContent('{~D:Record.View.options.DefaultDestinationAddress~}','')">Clear</a></li>
			<li class="PSFDV-Section-Button"><a href="javascript:void(0);" onclick="{~P~}.ContentAssignment.removeClass('#PSFDV-{~D:Record.View.Hash~}-Extra', 'PSFDV-Hidden')">Extra Data</a></li>
		</ul>
		<div id="PSFDV-{~D:Record.View.Hash~}-Extra" class="PSFDV-Hidden PSFDV-Section-ExtraData">
			<p class="PSFDV-Data">
				<span class="PSFDV-Label">Description:</span> {~D:Record.sectionDefinition.Description~}
			</p>
			<p class="PSFDV-Data">
				<span class="PSFDV-Label">Hash:</span> {~D:Record.View.Hash~}
			</p>
			<p class="PSFDV-Data">
				<span class="PSFDV-Label">HTML ID:</span> {~D:Record.View.sectionDefinition.Macro.HTMLID~}
			</p>
			<h4 class="PSFDV-Content-Header">Section Solvers:</h4>
			<div class="PSFDV-Section-Solvers">
				{~TS:Pict-Form-DebugViewer-SolverEntry:Record.Solvers[]<<~?ExpressionScope,==,Section?~>>~}
			</div>
			<h4 class="PSFDV-Content-Header">Tabular/RecordSet Solvers:</h4>
			<div class="PSFDV-Group-Solvers">
				{~TS:Pict-Form-DebugViewer-SolverEntry:Record.Solvers[]<<~?ExpressionScope,==,Group?~>>~}
			</div>
			<h4 class="PSFDV-Content-Header">Inputs:</h4>
			<div class="PSFDV-Section-Solver-DynamicInput">
				{~TS:Pict-Form-DebugViewer-GroupContainer:Record.View.sectionDefinition.Groups~}
			</div>
			<ul class="PSFDV-Section-Buttons">
				<li class="PSFDV-Section-Button"><a href="javascript:void(0);" onclick="{~P~}.ContentAssignment.addClass('#PSFDV-{~D:Record.View.Hash~}-Extra', 'PSFDV-Hidden')">Hide Extra Data for {~D:Record.View.Hash~}</a></li>
			</ul>
		</div>
	</div>
`
		},
		{
			Hash: "Pict-Form-DebugViewer-SolverEntry",
			Template: /*html*/`
			<div class="PSFDV-Section-Solver-Entry">
				<p class="PSFDV-Solver-Entry">{~D:Record.Expression~}</p>
				<p class="PSFDV-Data"><span class="PSFDV-Label">Last Result</span> <span class="PSFDV-Solver-Result">{~D:Record.LastResult~}</span></p>
				<p class="PSFDV-Data"><span class="PSFDV-Label">Sequence</span> Ordinal [{~D:Record.Ordinal~}] Index [{~D:Record.Index~}]</p>
			</div>
			`
		},
		{
			Hash: "Pict-Form-DebugViewer-GroupContainer",
			Template: /*html*/`
			<div class="PSFDV-Section-Group">
				<h5 class="PSFDV-Content-Header"><span class="PSFDV-DeEmphasize">Group:</span> {~D:Record.Name~} [idx <em>{~D:Record.GroupIndex~}</em>]</h5>
				<p class="PSFDV-Data"><span class="PSFDV-Label">Layout:</span> {~D:Record.Layout~}</p>
				<div class="PSFDV-Section-Rows">
					{~TS:Pict-Form-DebugViewer-RowContainer:Record.Rows~}
				</div>
			</div>
			`
		},
		{
			Hash: "Pict-Form-DebugViewer-RowContainer",
			Template: /*html*/`
					<div class="PSFDV-Section-Descriptors">
						<h6 class="PSFDV-Content-Header">Row {~D:Record.Hash~}</h6>
						{~TS:Pict-Form-DebugViewer-DescriptorContainer:Record.Inputs~}
					</div>
`
		},
		{
			Hash: "Pict-Form-DebugViewer-DescriptorContainer",
			Template: /*html*/`
						<div class="PSFDV-Section-Descriptor">
							<p class="PSFDV-DataHeader"><span class="PSFDV-DeEmphasize">Input:</span> {~D:Record.Name~}</p>
							<p class="PSFDV-Data"><span class="PSFDV-Label">Hash</span> {~D:Record.Hash~}</p>
							<p class="PSFDV-Data"><span class="PSFDV-Label">DataType</span> {~D:Record.DataType~}</p>
							<p class="PSFDV-Data"><span class="PSFDV-Label">InputType</span> {~D:Record.PictForm.InputType~}</p>
							<p class="PSFDV-Data"><span class="PSFDV-Label">Informary Data Address</span> {~D:Record.PictForm.InformaryDataAddress~}</p>
							<p class="PSFDV-Data"><span class="PSFDV-Label">Input Index</span> {~D:Record.PictForm.InputIndex~}</p>
							<p class="PSFDV-Data"><span class="PSFDV-Label">HTML ID</span> {~D:Record.PictForm.Macro.HTMLID~}</p>
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
	}
}

module.exports = PictFormsInlineEditor;

module.exports.default_configuration = defaultViewConfiguration;
