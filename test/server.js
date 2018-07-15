'use strict';

const path = require('path');

let express = require('express');
let app = express();
let port = 8080;

app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, '../OverlayFiles')));
app.use(express.static(path.join(__dirname, '../resources')));

require('./makeIndex')(port);

app.listen(port, function(err){
	if(err){
		console.error(err);
		process.exit(1);
	}

	console.log('Server listening on port %s', port);
})