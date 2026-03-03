/**
 * Bookstore Data Server
 *
 * A lightweight mock REST API server that serves bookstore data matching
 * the Meadow REST API URL patterns. This is used for development and
 * testing of pict-section-form example applications that use entity
 * bundle requests.
 *
 * Serves:
 *   GET /1.0/Authors/FilteredTo/{filter}/{start}/{count}
 *   GET /1.0/Authors/Count/FilteredTo/{filter}
 *   GET /1.0/Author/{id}
 *   GET /1.0/Books/FilteredTo/{filter}/{start}/{count}
 *   GET /1.0/Books/Count/FilteredTo/{filter}
 *   GET /1.0/Book/{id}
 *   GET /1.0/BookAuthorJoins/FilteredTo/{filter}/{start}/{count}
 *   GET /1.0/BookAuthorJoins/Count/FilteredTo/{filter}
 *   GET /1.0/BookAuthorJoin/{id}
 *   GET /1.0/{Entity}/Schema
 *
 * Also serves static files from the dist/ folder for the example app HTML.
 */

const libHTTP = require('http');
const libPath = require('path');
const libFS = require('fs');
const libURL = require('url');

const PORT = process.env.BOOKSTORE_PORT || 9999;

// ---- Bookstore Data ----

const Authors = [
	{ IDAuthor: 100, GUIDAuthor: 'GUID-Author-100', Name: 'Stephen King', CreatingIDUser: 1, UpdatingIDUser: 1 },
	{ IDAuthor: 200, GUIDAuthor: 'GUID-Author-200', Name: 'J.K. Rowling', CreatingIDUser: 1, UpdatingIDUser: 1 },
	{ IDAuthor: 300, GUIDAuthor: 'GUID-Author-300', Name: 'Isaac Asimov', CreatingIDUser: 1, UpdatingIDUser: 1 },
	{ IDAuthor: 400, GUIDAuthor: 'GUID-Author-400', Name: 'Ursula K. Le Guin', CreatingIDUser: 1, UpdatingIDUser: 1 },
	{ IDAuthor: 500, GUIDAuthor: 'GUID-Author-500', Name: 'Terry Pratchett', CreatingIDUser: 1, UpdatingIDUser: 1 },
	{ IDAuthor: 600, GUIDAuthor: 'GUID-Author-600', Name: 'Octavia Butler', CreatingIDUser: 1, UpdatingIDUser: 1 }
];

const Books = [
	{ IDBook: 1, GUIDBook: 'GUID-Book-1', Title: 'The Shining', PublicationYear: 1977, ImageURL: '' },
	{ IDBook: 2, GUIDBook: 'GUID-Book-2', Title: 'It', PublicationYear: 1986, ImageURL: '' },
	{ IDBook: 3, GUIDBook: 'GUID-Book-3', Title: 'The Stand', PublicationYear: 1978, ImageURL: '' },
	{ IDBook: 4, GUIDBook: 'GUID-Book-4', Title: 'Carrie', PublicationYear: 1974, ImageURL: '' },
	{ IDBook: 10, GUIDBook: 'GUID-Book-10', Title: "Harry Potter and the Philosopher's Stone", PublicationYear: 1997, ImageURL: '' },
	{ IDBook: 11, GUIDBook: 'GUID-Book-11', Title: 'Harry Potter and the Chamber of Secrets', PublicationYear: 1998, ImageURL: '' },
	{ IDBook: 12, GUIDBook: 'GUID-Book-12', Title: 'Harry Potter and the Prisoner of Azkaban', PublicationYear: 1999, ImageURL: '' },
	{ IDBook: 20, GUIDBook: 'GUID-Book-20', Title: 'Foundation', PublicationYear: 1951, ImageURL: '' },
	{ IDBook: 21, GUIDBook: 'GUID-Book-21', Title: 'I, Robot', PublicationYear: 1950, ImageURL: '' },
	{ IDBook: 22, GUIDBook: 'GUID-Book-22', Title: 'The Caves of Steel', PublicationYear: 1954, ImageURL: '' },
	{ IDBook: 30, GUIDBook: 'GUID-Book-30', Title: 'A Wizard of Earthsea', PublicationYear: 1968, ImageURL: '' },
	{ IDBook: 31, GUIDBook: 'GUID-Book-31', Title: 'The Left Hand of Darkness', PublicationYear: 1969, ImageURL: '' },
	{ IDBook: 32, GUIDBook: 'GUID-Book-32', Title: 'The Dispossessed', PublicationYear: 1974, ImageURL: '' },
	{ IDBook: 40, GUIDBook: 'GUID-Book-40', Title: 'Good Omens', PublicationYear: 1990, ImageURL: '' },
	{ IDBook: 41, GUIDBook: 'GUID-Book-41', Title: 'Guards! Guards!', PublicationYear: 1989, ImageURL: '' },
	{ IDBook: 42, GUIDBook: 'GUID-Book-42', Title: 'Mort', PublicationYear: 1987, ImageURL: '' },
	{ IDBook: 50, GUIDBook: 'GUID-Book-50', Title: 'Kindred', PublicationYear: 1979, ImageURL: '' },
	{ IDBook: 51, GUIDBook: 'GUID-Book-51', Title: 'Parable of the Sower', PublicationYear: 1993, ImageURL: '' },
	{ IDBook: 52, GUIDBook: 'GUID-Book-52', Title: "Dawn", PublicationYear: 1987, ImageURL: '' }
];

const BookAuthorJoins = [
	// Stephen King
	{ IDBookAuthorJoin: 1, GUIDBookAuthorJoin: 'GUID-BAJ-1', IDBook: 1, IDAuthor: 100 },
	{ IDBookAuthorJoin: 2, GUIDBookAuthorJoin: 'GUID-BAJ-2', IDBook: 2, IDAuthor: 100 },
	{ IDBookAuthorJoin: 3, GUIDBookAuthorJoin: 'GUID-BAJ-3', IDBook: 3, IDAuthor: 100 },
	{ IDBookAuthorJoin: 4, GUIDBookAuthorJoin: 'GUID-BAJ-4', IDBook: 4, IDAuthor: 100 },
	// J.K. Rowling
	{ IDBookAuthorJoin: 10, GUIDBookAuthorJoin: 'GUID-BAJ-10', IDBook: 10, IDAuthor: 200 },
	{ IDBookAuthorJoin: 11, GUIDBookAuthorJoin: 'GUID-BAJ-11', IDBook: 11, IDAuthor: 200 },
	{ IDBookAuthorJoin: 12, GUIDBookAuthorJoin: 'GUID-BAJ-12', IDBook: 12, IDAuthor: 200 },
	// Isaac Asimov
	{ IDBookAuthorJoin: 20, GUIDBookAuthorJoin: 'GUID-BAJ-20', IDBook: 20, IDAuthor: 300 },
	{ IDBookAuthorJoin: 21, GUIDBookAuthorJoin: 'GUID-BAJ-21', IDBook: 21, IDAuthor: 300 },
	{ IDBookAuthorJoin: 22, GUIDBookAuthorJoin: 'GUID-BAJ-22', IDBook: 22, IDAuthor: 300 },
	// Ursula K. Le Guin
	{ IDBookAuthorJoin: 30, GUIDBookAuthorJoin: 'GUID-BAJ-30', IDBook: 30, IDAuthor: 400 },
	{ IDBookAuthorJoin: 31, GUIDBookAuthorJoin: 'GUID-BAJ-31', IDBook: 31, IDAuthor: 400 },
	{ IDBookAuthorJoin: 32, GUIDBookAuthorJoin: 'GUID-BAJ-32', IDBook: 32, IDAuthor: 400 },
	// Terry Pratchett
	{ IDBookAuthorJoin: 40, GUIDBookAuthorJoin: 'GUID-BAJ-40', IDBook: 40, IDAuthor: 500 },
	{ IDBookAuthorJoin: 41, GUIDBookAuthorJoin: 'GUID-BAJ-41', IDBook: 41, IDAuthor: 500 },
	{ IDBookAuthorJoin: 42, GUIDBookAuthorJoin: 'GUID-BAJ-42', IDBook: 42, IDAuthor: 500 },
	// Octavia Butler
	{ IDBookAuthorJoin: 50, GUIDBookAuthorJoin: 'GUID-BAJ-50', IDBook: 50, IDAuthor: 600 },
	{ IDBookAuthorJoin: 51, GUIDBookAuthorJoin: 'GUID-BAJ-51', IDBook: 51, IDAuthor: 600 },
	{ IDBookAuthorJoin: 52, GUIDBookAuthorJoin: 'GUID-BAJ-52', IDBook: 52, IDAuthor: 600 }
];

const EntityMap =
{
	'Author': { data: Authors, idField: 'IDAuthor' },
	'Book': { data: Books, idField: 'IDBook' },
	'BookAuthorJoin': { data: BookAuthorJoins, idField: 'IDBookAuthorJoin' }
};

// ---- Meadow Filter Parser ----

/**
 * Parse a Meadow filter expression and apply it to a dataset.
 *
 * Supported filter types:
 *   FBV~Field~Operator~Value  (Filter By Value)
 *   FBL~Field~Operator~Value  (Filter By List - comma-separated values)
 *
 * Supported operators: EQ, NE, GT, GE, LT, LE, LK (like), INN (in list)
 */
function applyMeadowFilter(pDataSet, pFilterExpression)
{
	if (!pFilterExpression || pFilterExpression === '~')
	{
		return pDataSet;
	}

	let tmpParts = pFilterExpression.split('~');
	let tmpFiltered = pDataSet;
	let i = 0;

	while (i < tmpParts.length)
	{
		let tmpFilterType = tmpParts[i];

		if (tmpFilterType === 'FBV' && i + 3 < tmpParts.length)
		{
			let tmpField = tmpParts[i + 1];
			let tmpOperator = tmpParts[i + 2];
			let tmpValue = tmpParts[i + 3];
			tmpFiltered = filterByValue(tmpFiltered, tmpField, tmpOperator, tmpValue);
			i += 4;
		}
		else if (tmpFilterType === 'FBL' && i + 3 < tmpParts.length)
		{
			let tmpField = tmpParts[i + 1];
			let tmpOperator = tmpParts[i + 2];
			let tmpValue = tmpParts[i + 3];
			tmpFiltered = filterByList(tmpFiltered, tmpField, tmpOperator, tmpValue);
			i += 4;
		}
		else
		{
			i++;
		}
	}

	return tmpFiltered;
}

function filterByValue(pDataSet, pField, pOperator, pValue)
{
	return pDataSet.filter(
		(pRecord) =>
		{
			let tmpRecordValue = pRecord[pField];
			let tmpCompareValue = pValue;

			// Try numeric comparison
			if (!isNaN(tmpRecordValue) && !isNaN(tmpCompareValue))
			{
				tmpRecordValue = Number(tmpRecordValue);
				tmpCompareValue = Number(tmpCompareValue);
			}

			switch (pOperator)
			{
				case 'EQ': return tmpRecordValue == tmpCompareValue;
				case 'NE': return tmpRecordValue != tmpCompareValue;
				case 'GT': return tmpRecordValue > tmpCompareValue;
				case 'GE': return tmpRecordValue >= tmpCompareValue;
				case 'LT': return tmpRecordValue < tmpCompareValue;
				case 'LE': return tmpRecordValue <= tmpCompareValue;
				case 'LK': return String(tmpRecordValue).indexOf(String(tmpCompareValue)) >= 0;
				default: return true;
			}
		});
}

function filterByList(pDataSet, pField, pOperator, pValue)
{
	let tmpValues = pValue.split(',').map((v) => v.trim());

	return pDataSet.filter(
		(pRecord) =>
		{
			let tmpRecordValue = String(pRecord[pField]);

			switch (pOperator)
			{
				case 'INN': return tmpValues.indexOf(tmpRecordValue) >= 0;
				case 'NIN': return tmpValues.indexOf(tmpRecordValue) < 0;
				default: return true;
			}
		});
}

// ---- MIME Types ----

const MimeTypes =
{
	'.html': 'text/html',
	'.js': 'application/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.svg': 'image/svg+xml'
};

// ---- Request Handler ----

function handleRequest(pRequest, pResponse)
{
	let tmpParsedUrl = libURL.parse(pRequest.url, true);
	let tmpPath = tmpParsedUrl.pathname;

	// CORS headers
	pResponse.setHeader('Access-Control-Allow-Origin', '*');
	pResponse.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
	pResponse.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	if (pRequest.method === 'OPTIONS')
	{
		pResponse.writeHead(200);
		pResponse.end();
		return;
	}

	// Try API routes first
	if (tmpPath.startsWith('/1.0/'))
	{
		return handleAPIRequest(tmpPath, pResponse);
	}

	// Serve static files from dist/
	return serveStaticFile(tmpPath, pResponse);
}

function handleAPIRequest(pPath, pResponse)
{
	let tmpPathParts = pPath.replace('/1.0/', '').split('/');
	let tmpEntityPart = tmpPathParts[0];

	// Schema requests: /1.0/{Entity}/Schema
	if (tmpPathParts.length >= 2 && tmpPathParts[1] === 'Schema')
	{
		let tmpEntityName = tmpEntityPart.replace(/s$/, '');
		let tmpEntity = EntityMap[tmpEntityName];
		if (tmpEntity)
		{
			let tmpSchema = {};
			if (tmpEntity.data.length > 0)
			{
				let tmpSample = tmpEntity.data[0];
				for (let tmpKey of Object.keys(tmpSample))
				{
					tmpSchema[tmpKey] = typeof(tmpSample[tmpKey]);
				}
			}
			return sendJSON(pResponse, tmpSchema);
		}
		return send404(pResponse, `Schema not found for ${tmpEntityPart}`);
	}

	// Single entity: /1.0/{Entity}/{ID}
	// Check if the entity name (singular) matches and the next part is a number
	for (let tmpEntityName of Object.keys(EntityMap))
	{
		let tmpEntityInfo = EntityMap[tmpEntityName];

		// Plural form: Authors, Books, BookAuthorJoins
		let tmpPlural = tmpEntityName + 's';

		if (tmpEntityPart === tmpEntityName && tmpPathParts.length === 2 && !isNaN(tmpPathParts[1]))
		{
			// Single record by ID
			let tmpID = Number(tmpPathParts[1]);
			let tmpRecord = tmpEntityInfo.data.find((r) => r[tmpEntityInfo.idField] === tmpID);
			if (tmpRecord)
			{
				return sendJSON(pResponse, tmpRecord);
			}
			return send404(pResponse, `${tmpEntityName} ${tmpID} not found`);
		}

		if (tmpEntityPart === tmpPlural)
		{
			// Count: /1.0/{Entities}/Count/FilteredTo/{filter}
			if (tmpPathParts[1] === 'Count' && tmpPathParts[2] === 'FilteredTo')
			{
				let tmpFilter = tmpPathParts.slice(3).join('/');
				let tmpFiltered = applyMeadowFilter(tmpEntityInfo.data, tmpFilter);
				return sendJSON(pResponse, { Count: tmpFiltered.length });
			}

			// Filtered set: /1.0/{Entities}/FilteredTo/{filter}/{start}/{count}
			if (tmpPathParts[1] === 'FilteredTo')
			{
				// The filter expression may contain tildes, and the last two parts are start/count
				let tmpRemainingParts = tmpPathParts.slice(2);
				let tmpCount = parseInt(tmpRemainingParts.pop(), 10) || 100;
				let tmpStart = parseInt(tmpRemainingParts.pop(), 10) || 0;
				let tmpFilter = tmpRemainingParts.join('/');
				let tmpFiltered = applyMeadowFilter(tmpEntityInfo.data, tmpFilter);
				let tmpPaged = tmpFiltered.slice(tmpStart, tmpStart + tmpCount);
				return sendJSON(pResponse, tmpPaged);
			}

			// Unfiltered set: /1.0/{Entities}/{start}/{count}
			if (tmpPathParts.length >= 3 && !isNaN(tmpPathParts[1]))
			{
				let tmpStart = parseInt(tmpPathParts[1], 10) || 0;
				let tmpCount = parseInt(tmpPathParts[2], 10) || 100;
				let tmpPaged = tmpEntityInfo.data.slice(tmpStart, tmpStart + tmpCount);
				return sendJSON(pResponse, tmpPaged);
			}

			// Default: return all
			return sendJSON(pResponse, tmpEntityInfo.data);
		}
	}

	return send404(pResponse, `Unknown API path: ${pPath}`);
}

function serveStaticFile(pPath, pResponse)
{
	if (pPath === '/' || pPath === '')
	{
		pPath = '/index.html';
	}

	let tmpFilePath = libPath.join(__dirname, 'dist', pPath);
	let tmpExt = libPath.extname(tmpFilePath).toLowerCase();
	let tmpMimeType = MimeTypes[tmpExt] || 'application/octet-stream';

	libFS.readFile(tmpFilePath,
		(pError, pData) =>
		{
			if (pError)
			{
				pResponse.writeHead(404);
				pResponse.end(`File not found: ${pPath}`);
				return;
			}
			pResponse.writeHead(200, { 'Content-Type': tmpMimeType });
			pResponse.end(pData);
		});
}

function sendJSON(pResponse, pData)
{
	pResponse.writeHead(200, { 'Content-Type': 'application/json' });
	pResponse.end(JSON.stringify(pData));
}

function send404(pResponse, pMessage)
{
	pResponse.writeHead(404, { 'Content-Type': 'application/json' });
	pResponse.end(JSON.stringify({ Error: pMessage }));
}

// ---- Start Server ----

let tmpServer = libHTTP.createServer(handleRequest);

tmpServer.listen(PORT,
	() =>
	{
		console.log(`Bookstore Data Server running on http://localhost:${PORT}`);
		console.log(`API:    http://localhost:${PORT}/1.0/`);
		console.log(`App:    http://localhost:${PORT}/`);
		console.log(`Authors: ${Authors.length}, Books: ${Books.length}, Joins: ${BookAuthorJoins.length}`);
	});
