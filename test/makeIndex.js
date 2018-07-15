'uses strict';

const fs = require('fs')
	, path = require('path')
	, handlebars = require('handlebars');

const OVERLAY_DIR = path.join(__dirname, '../OverlayFiles');

module.exports = function(port){
	try{
		if(fs.existsSync(path.join(__dirname, 'index.html'))) 
			fs.unlinkSync(path.join(__dirname, 'index.html'));
		let templates = fs.readdirSync(OVERLAY_DIR);
		let variables = {templates: templates, port: port};
		let merged = handlebars.compile(template)(variables);
		fs.writeFileSync(path.join(__dirname, 'index.html'), merged);
		console.info('wrote index.html with content: \n%s\nVariables: %s', merged, JSON.stringify(variables));
		return true;
	} catch(e){
		console.error(e);
		process.exit(1);
	}
}

let template = 
`<!DOCTYPE html>
<html>
	<head>
		<title>Test Overlay Files</title>
	</head>
	<body>
		<h2>Overlay Files:</h2>
		<ul>
		{{#each templates}}
			<li><a href="http://localhost:{{../port}}/{{this}}">{{this}}</a></li>
		{{/each}}
		</ul>
	</body>
</html>`