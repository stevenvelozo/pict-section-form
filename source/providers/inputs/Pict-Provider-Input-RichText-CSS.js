/**
 * Pict-Provider-Input-RichText-CSS.js
 *
 * Scoped CSS for the RichText form-input slot. Registered via
 * `pict.CSSMap.addCSS('Pict-Input-RichText-CSS', libCSS, 500)` from the
 * provider's constructor.
 *
 * All colors flow through theme tokens with hex fallbacks so the input looks
 * correct standalone (no theme provider) and adapts when a theme provider is
 * mounted. Three font-stack tokens (`--theme-font-body`, `--theme-font-mono`)
 * are pulled the same way.
 *
 * Class names:
 *
 *   .pict-section-form-richtext        the outer slot the form template emits
 *   .pict-section-form-richtext-view   the rendered-markdown container (view mode)
 *   .pict-section-form-richtext-edit   the editor container (edit mode)
 *   .pict-section-form-richtext-toggle "Edit" / "Done" affordance the consumer
 *                                      can render inside the slot if they want
 *                                      a built-in mode-switch chip
 */

module.exports = /*css*/`
.pict-section-form-richtext
{
	display: block;
	width: 100%;
	min-height: 64px;
	border: 1px solid var(--theme-color-border-primary, #D4C4A8);
	border-radius: 4px;
	background: var(--theme-color-background-primary, #FFFFFF);
	color: var(--theme-color-text-primary, #2A2520);
	font-family: var(--theme-font-body, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
	font-size: 0.95rem;
	line-height: 1.55;
	box-sizing: border-box;
}

.pict-section-form-richtext-view
{
	padding: 10px 14px;
	min-height: 48px;
}

.pict-section-form-richtext-view.is-empty
{
	color: var(--theme-color-text-muted, #8A7F72);
	font-style: italic;
}

.pict-section-form-richtext-view :first-child { margin-top: 0; }
.pict-section-form-richtext-view :last-child  { margin-bottom: 0; }

.pict-section-form-richtext-view h1,
.pict-section-form-richtext-view h2,
.pict-section-form-richtext-view h3,
.pict-section-form-richtext-view h4
{
	color: var(--theme-color-text-heading, var(--theme-color-text-primary, #2A2520));
	margin: 0.6em 0 0.3em 0;
	line-height: 1.25;
}

.pict-section-form-richtext-view code
{
	font-family: var(--theme-font-mono, 'SFMono-Regular', Menlo, monospace);
	font-size: 0.9em;
	padding: 1px 5px;
	background: var(--theme-color-background-tertiary, #F4EEE2);
	border-radius: 3px;
}

.pict-section-form-richtext-view pre
{
	font-family: var(--theme-font-mono, 'SFMono-Regular', Menlo, monospace);
	background: var(--theme-color-background-tertiary, #F4EEE2);
	padding: 10px 12px;
	border-radius: 4px;
	overflow: auto;
}

.pict-section-form-richtext-view blockquote
{
	margin: 0.5em 0;
	padding: 4px 12px;
	border-left: 3px solid var(--theme-color-accent, #2E7D74);
	color: var(--theme-color-text-secondary, #5A4A3C);
	background: var(--theme-color-background-secondary, #FBF7EE);
}

.pict-section-form-richtext-view img
{
	max-width: 100%;
	height: auto;
	border-radius: 3px;
}

.pict-section-form-richtext-edit
{
	padding: 0;
	min-height: 220px;
}

/*
 * The editor (pict-section-markdowneditor) brings its own chrome inside the
 * slot. We just provide a container border + sane min-height; CodeMirror takes
 * over from there.
 */

/* Optional mode-toggle affordance — render inside the slot from the host UI
 * via _Pict.providers['Pict-Input-RichText'].toggleMode('<hash>'). The chip is
 * absolutely positioned in the top-right corner so it doesn't take a column
 * from the form layout. */
.pict-section-form-richtext { position: relative; }

.pict-section-form-richtext-toggle
{
	position: absolute;
	top: 6px;
	right: 6px;
	z-index: 2;
	padding: 3px 9px;
	font-size: 0.72rem;
	font-weight: 600;
	color: var(--theme-color-text-secondary, #5A4A3C);
	background: var(--theme-color-background-tertiary, #F4EEE2);
	border: 1px solid var(--theme-color-border-secondary, #D4C4A8);
	border-radius: 3px;
	cursor: pointer;
	user-select: none;
}

.pict-section-form-richtext-toggle:hover
{
	color: var(--theme-color-text-primary, #2A2520);
	background: var(--theme-color-background-primary, #FFFFFF);
	border-color: var(--theme-color-accent, #2E7D74);
}

.pict-section-form-richtext.mode-edit  .pict-section-form-richtext-toggle::after { content: 'Done'; }
.pict-section-form-richtext.mode-view  .pict-section-form-richtext-toggle::after { content: 'Edit'; }
`;
