'use strict';

const path = require('path');
const chalk = require('chalk');

let express = require('express');
let app = express();
let port = 8080;

app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, '..')));
app.use('/resources', express.static(path.join(__dirname, '..')));

require('./makeIndex')(port);

app.listen(port, function(err){
	if(err){
		console.error(err);
		process.exit(1);
	}

	console.log(chalk.green('Server listening on port', chalk.magenta(port)));
	console.log(chalk.blue('http://localhost:' + port));
})