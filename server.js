#!/bin/env/node
const express = require('express');
const http = require('http');
const path = require('path');
const sqldb = require('./sqldb');
const bodyParser = require('body-parser');
const config = require('./config');
const app = express();

// app config
app.set('port', config.port);

// routes
app.post('/report', bodyParser.json(), (req, res) => {
    try{
		const reportRow = req.body;
		reportRow.createdAt = Date.now();

		const reportModel = sqldb().report;
		reportModel.create(reportRow)
		.then((result) => {
        	return res.status(201).send(result);
    	}).catch((err) => {
    		return res.status(412).send(err);
    	})
	}catch(err){
		res.status(412).send(err);
	}
});

app.get('/report/:id', (req, res) => {
	try{
		const reportModel = sqldb().report;
		reportModel.findOne({
			where: {
					id: req.params.id
				}
			})
	        .then(function reportFindAll(reports) {
	        	if (reports == null){
	        		reports = {};
	        	}
	        	res.status(200).send(reports);
	        })
	        .catch(function(err){
	        	res.status(412).send(err);
	        });
	}catch(err){
		res.status(412).send(err);
	}
});


// initialize~
http.createServer(app).listen(app.get('port'), function () {
    console.log('Big Zam API listening on port %d...', app.get('port'));
});

process.on('SIGINT', function() {
    process.exit();
});

