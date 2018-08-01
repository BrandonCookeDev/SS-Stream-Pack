'use strict';

const fs = require('fs');
const path = require('path');

const OVERLAY_DIR = path.join(__dirname, '..', 'OverlayFiles');

let files = fs.readdirSync(OVERLAY_DIR);
files.forEach(filename => { 
	let filepath = path.join(OVERLAY_DIR, filename);
	
	let type;
	if(filename.indexOf('Melee') > 0) type = 'MELEE';
	else if(filename.indexOf('Smash4') > 0) type = 'SMASH4';
	else type = 'OTHER';

	verify(filepath, type);
})

function verify(file, type){
	let content = fs.readFileSync(file, 'utf8');
	let srcRegex = new RegExp(/^:src=$/gi);
	let s4Regex = new RegExp(/^:src=[\S]*S4$/gi);

	let matches = s4Regex.exec(content) || [];
	switch(type){
	case 'MELEE':
		if(matches.length > 0)
			console.error('Melee file [%s]: positive number of S4 variable instances: \n%s', file, matches);
		break;
	case 'SMASH4':
		let srcCount = srcRegex.exec(content) || [];
		if(srcCount != matches)
			console.error('Smash4 file [%s]: Mismatch of src tags and S4 variable instances', file);
		break;
	default:
		console.log('Skipping file %s', file);
		break;
	}
}