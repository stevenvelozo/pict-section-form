/**
 * Themeify-SVG.js
 *
 * Rewrite an exported Excalidraw SVG so its palette colors become CSS custom
 * properties with hex fallbacks:
 *
 *     stroke="#1B1F23"  ->  stroke="var(--diagram-ink, #1B1F23)"
 *
 * With no variables set, the hex fallback renders the original look, so the
 * SVG is correct standalone (in an <img>, a file viewer, etc.). When an
 * embedder that inlines the SVG sets `--diagram-ink` and the other tokens
 * per active theme, the same single SVG adapts live, light/dark.
 *
 * The embedded <metadata> block (base64 Excalidraw scene) is protected and
 * left byte-for-byte intact so the scene still round-trips into
 * pict-section-excalidraw for hand-editing.
 *
 * Token names (all under the --diagram- namespace):
 *   ink, paper, accent, highlight, deemphasis, link
 *
 * This file mirrors the canonical implementation at
 * `pict-renderer-graph/source/Pict-Renderer-Graph-Theme-SVG.js`. The two are
 * kept in sync by hand. If you edit the regex pass here, update the other.
 * The reason for the duplication: this section module renders directly into
 * a browser DOM, and we don't want to pull pict-renderer-graph (which spins
 * up Chromium) in as a runtime dependency.
 */

const _PaletteTokens = ['ink', 'paper', 'accent', 'highlight', 'deemphasis', 'link'];

// The default Excalidraw notebook palette we map TO theme tokens. Callers can
// pass their own palette via the second arg; this is the fallback so callers
// who just want the standard mapping don't have to specify anything.
const _DefaultPalette =
{
	ink:        '#1B1F23',
	paper:      '#FDFCF7',
	accent:     '#E66C2C',
	highlight:  '#FFD966',
	deemphasis: '#A0A0A0',
	link:       '#2E7D74'
};

function escapeRegExp(pStr)
{
	return pStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Rewrite the palette colors in an SVG to CSS variables with hex fallbacks.
 *
 * @param {string} pSVG - The exported SVG string.
 * @param {object} [pPaletteOrProfile] - Either a flat palette
 *   `{ink, paper, accent, ...}` OR a style profile carrying `.Palette`. When
 *   omitted, the standard notebook palette is used.
 * @returns {string} The SVG with palette colors rewritten to CSS variables.
 */
function themeifySVG(pSVG, pPaletteOrProfile)
{
	if (typeof pSVG !== 'string')
	{
		return pSVG;
	}

	let tmpPalette = _DefaultPalette;
	if (pPaletteOrProfile && typeof pPaletteOrProfile === 'object')
	{
		// Accept either a profile-shaped object (has .Palette) or a bare palette.
		tmpPalette = pPaletteOrProfile.Palette || pPaletteOrProfile;
	}

	// Protect the metadata block — it carries the embedded scene verbatim.
	let tmpMetaMatch   = pSVG.match(/<metadata[\s\S]*?<\/metadata>/i);
	let tmpMeta        = tmpMetaMatch ? tmpMetaMatch[0] : '';
	let tmpPlaceholder = ' PICT-SECTION-EXCALIDRAW-METADATA ';
	let tmpBody        = tmpMeta ? pSVG.replace(tmpMeta, tmpPlaceholder) : pSVG;

	for (let i = 0; i < _PaletteTokens.length; i++)
	{
		let tmpToken = _PaletteTokens[i];
		let tmpHex   = tmpPalette[tmpToken];
		if ((typeof tmpHex !== 'string') || !/^#[0-9a-fA-F]{6}$/.test(tmpHex))
		{
			continue;
		}
		// Match the hex only where it's used as a color: a stroke= / fill=
		// attribute, or a stroke: / fill: inside a style string. The property
		// must be immediately followed by =" or : so we never catch
		// "strokeColor" in the source JSON (followed by ").
		let tmpRegExp = new RegExp('(stroke|fill)(="|:\\s*)(' + escapeRegExp(tmpHex) + ')(?=["\\s;)])', 'gi');
		tmpBody = tmpBody.replace(tmpRegExp, (pWhole, pProp, pSep, pHex) =>
		{
			return pProp + pSep + 'var(--diagram-' + tmpToken + ', ' + pHex + ')';
		});
	}

	return tmpMeta ? tmpBody.replace(tmpPlaceholder, tmpMeta) : tmpBody;
}

module.exports =
{
	themeifySVG:    themeifySVG,
	paletteTokens:  _PaletteTokens,
	defaultPalette: _DefaultPalette
};
