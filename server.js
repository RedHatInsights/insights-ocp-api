#!/bin/env/node
const express = require('express');
const http = require('http');
const path = require('path');
const sqldb = require('./sqldb');
const bodyParser = require('body-parser');
const config = require('./config');
const app = express();
const scanQueue = [];

// app config
app.set('port', config.port);

// routes
app.post('/reports/:id', bodyParser.json({limit: '50mb'}), (req, res) => {
    console.log(`Incoming POST for image ID ${req.params.id}...`);
    const report = {
        image_id: req.params.id,
        // hostname: req.system.hostname,
        report: JSON.stringify(req.body)
    };

    const reportModel = sqldb().report;
    reportModel.upsert(report)
    .then(result => {
        return res.status(201).send(result);
    }).catch(err => {
        return res.status(412).send(err);
    });
});

app.get('/reports', (req, res) => {
    const reportModel = sqldb().report;
    reportModel.findAll({
        attributes:['image_id', 'updated_at']
    })
    .then(reports => {
        if (reports === null) {
            reports = {};
        }
        res.status(200).send(reports);
    })
    .catch(err => {
        res.status(412).send(err);
    });
});

app.get('/reports/:id', (req, res) => {
    const reportModel = sqldb().report;
    reportModel.findOne({
        where: {
            image_id: req.params.id
        }
    })
    .then(reports => {
        if (reports === null) {
            reports = {};
        }
        res.status(200).send(reports);
    })
    .catch(err => {
        res.status(412).send(err);
    });
});

// routes
app.get('/queue', (req, res) => {
    console.log(`Incoming GET for entire queue`);
    return res.status(200).send(scanQueue);
});

// Queue an Image ID
app.post('/queue/:id', bodyParser.json({limit: '50mb'}), (req, res) => {
    console.log(`Incoming POST Queue for image ID ${req.params.id}...`);

    // If the Image already exists in the Queue then exit.
    if ( scanQueue.indexOf(req.params.id) != -1 ){
        console.log(`Queue exists for image ID ${req.params.id}...`);
        return res.status(423).send();

    // Otherwise check if it has been scanned within the past 24 hours
    }else{

        const reportModel = sqldb().report;
        reportModel.findOne({
            where: {
                image_id: req.params.id
            }
        })
        .then(reports => {
            if (reports === null) {
                reports = {};
            }
            if !( 'created_at' in reports.hasProperty() ){
                console.log(`Queue added for image ID ${req.params.id}...`));
                scanQueue.push(req.params.id);
                return res.status(201).send();
            }

            let reportTime = new Date(reports.created_at);
            let currTime = new Date();
            let hoursElapsed = Math.abs(date1 - date2) / 36e5;
            if ( hoursElapsed < 24 ){
                console.log(`Queue added for image ID ${req.params.id}...`);
                scanQueue.push(req.params.id);
                return res.status(201).send();
            }else{
                console.log(`Queue not added for image ID ${req.params.id}, scanned within past 24 hours`);
                return res.status(412).send();
            }
        })
        .catch(err => {
            return res.status(412).send(err);
        });

    }
});

// Dequeue image ID
app.post('/dequeue/:id', bodyParser.json({limit: '50mb'}), (req, res) => {
    console.log(`Incoming POST Dequeue for image ID ${req.params.id}...`);

    // If the image ID exists in the queue, then remove it
    if ( scanQueue.indexOf(req.params.id) != -1 ){
        console.log(`Removing queue for image ID ${req.params.id}...`);
        scanQueue.splice(scanQueue.indexOf(req.params.id, 1));
        return res.status(204).send();

    // Otherwise it does not exist, this was an invalid request
    }else{
        console.log(`No queue for image ID ${req.params.id}...`);
        return res.status(412).send();
    }
});


// initialize~
sqldb().sequelize.sync()
.then(() => {
    http.createServer(app).listen(app.get('port'), () => {
        console.log('Big Zam API listening on port %d...', app.get('port'));
    });
})
.catch(err => {
    console.log(err);
    process.exit();
});

process.on('SIGINT', () => {
    process.exit();
});

