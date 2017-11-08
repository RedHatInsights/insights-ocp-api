#!/bin/env/node
const express = require('express');
const http = require('http');
const path = require('path');
const sqldb = require('./sqldb');
const bodyParser = require('body-parser');
const pugToHtml = require('./pugToHtml');

const config = require('./config');
const app = express();

// app config
app.set('port', config.port);

// routes
app.post('/report', bodyParser.json(), (req, res) => {
    //
});

app.get('/report/:id', (req, res) => {
    //
});


// initialize~
http.createServer(app).listen(app.get('port'), function () {
    console.log('Big Zam API listening on port %d...', app.get('port'));
});

process.on('SIGINT', function() {
    process.exit();
});

