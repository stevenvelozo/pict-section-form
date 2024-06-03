const libFS = require('fs');

let tmpFruityData = require('../simple_table/FruitData.json');

let tmpFruityViceObjectMap = {};

for (let i = 0; i < tmpFruityData.FruityVice.length; i++)
{
	let tmpFruit = tmpFruityData.FruityVice[i];
	tmpFruityKey = `${tmpFruit.name}${tmpFruit.family}${tmpFruit.order}${tmpFruit.genus}`;
	tmpFruityViceObjectMap[tmpFruityKey] = tmpFruit;
}

tmpFruityData.FruityViceObject = tmpFruityViceObjectMap;
delete tmpFruityData.FruityVice;

libFS.writeFileSync('./FruitDataInAnObject.json', JSON.stringify(tmpFruityData,null,4));

console.log('Your fruit has been migrated... have a nice day!')