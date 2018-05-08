#!/bin/env/node
const express = require('express');
const http = require('http');
const path = require('path');
const sqldb = require('./sqldb');
const bodyParser = require('body-parser');
const config = require('./config');
const app = express();
const env = process.env;
const scanQueue = {};
let scanStatus = {'scanning' : true};

// app config
app.set('port', config.port);

function init() {
    sqldb().sequelize.sync()
    .then(() => {
        // check whether scanning is running or halted on init
        return sqldb().status.findById(0);
    })
    .then(dbScanStatus => {
        scanStatus = dbScanStatus ? dbScanStatus : scanStatus;
        http.createServer(app).listen(app.get('port'), () => {
            console.log('Insights OCP API listening on port %d...', app.get('port'));
        });
    })
    .catch(err => {
        console.log(err);
        process.exit();
    });

    process.on('SIGINT', () => {
        process.exit();
    });
}

function changeScanStatus(s) {
    scanStatus.scanning = s;
    const status = {
        id: 0,
        scanning: s
    }
    return sqldb().status.upsert(status);
}

// Post a report
app.post('/reports/:id', bodyParser.json({limit: '50mb'}), (req, res) => {
    console.log(`Incoming POST for image ID ${req.params.id}...`);
    const report = {
        image_id: req.params.id,
        image_name: req.query.name,
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

// Get all reports
app.get('/reports', (req, res) => {
    const reportModel = sqldb().report;
    reportModel.findAll({
        attributes:['image_id', 'image_name', 'updated_at']
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

// Get report by ID
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

// Get entire queue
app.get('/queue', (req, res) => {
    console.log(`Incoming GET for entire queue`);
    return res.status(200).send(scanQueue);
});

// Queue an Image ID
app.post('/queue/:id', bodyParser.json({limit: '50mb'}), (req, res) => {
    console.log(`Incoming POST Queue for image ID ${req.params.id}...`);

    // Check the current scan status
    if (scanStatus.scanning) {
        let concurrentScanLimit = process.env.CONCURRENT_SCAN_LIMIT ? parseInt(process.env.CONCURRENT_SCAN_LIMIT) : 2;

        // If there are more than the number of allowed (default of two) scans going on 
        // then send back 403 (continue trying)
        if ( scanQueue.length >= concurrentScanLimit ){
            console.log(`Too many concurrent scans, sending timeout to scanner for ${req.params.id}...`);
            return res.status(403).send();
            
        // If the Image already exists in the Queue then check when it was queued.
        }else if ( req.params.id in scanQueue ){
            let queueTime = new Date(scanQueue[req.params.id].queued);
            console.log(`queueTime for ${req.params.id} is ${queueTime}`);

            let currTime = new Date();
            console.log(`currTime for ${req.params.id} is ${currTime}`);

            let queueHoursElapsed = Math.abs(currTime - queueTime) / 36e5;
            console.log(`queueHoursElapsed for ${req.params.id} is ${queueHoursElapsed}`);

            // If it was not queued within the past 24 hours allow
            // This fixes edge cases where things were not dequeued properly
            if ( queueHoursElapsed >= 24 ){
                console.log(`Queue added for image ID ${req.params.id}...`);
                scanQueue[req.params.id] = {
                    'image_id' : req.params.id,
                    'queued' : new Date()
                };
                return res.status(201).send();
            }else{
                console.log(`Queue exists for image ID ${req.params.id}...`);
                return res.status(423).send();
            }

        // Otherwise check if it has been scanned within the past 24 hours
        }else{

            // Get the report from the database
            const reportModel = sqldb().report;
            reportModel.findOne({
                where: {
                    image_id: req.params.id
                }
            })
            .then(reports => {

                console.log(`Found reports for ${req.params.id}: ${reports}`);
                console.log(reports);
                console.log(reports.updated_at);
                if (reports === null) {
                    console.log('Reports was null, setting to {}');
                    reports = {};
                }
                // Check if it actually has a updated_at property (actually been scanned)
                if (!reports.hasOwnProperty('updated_at')) {
                    console.log(`Queue added for image ID ${req.params.id}...`);
                    scanQueue[req.params.id] = {
                        'image_id' : req.params.id,
                        'queued' : new Date()
                    };
                    return res.status(201).send();
                }

                // Calculate difference in hours (<24)
                let reportTime = new Date(reports.updated_at);
                console.log(`reportTime for ${req.params.id} is ${reportTime}`);

                let currTime = new Date();
                console.log(`currTime for ${req.params.id} is ${currTime}`);

                let reportHoursElapsed = Math.abs(currTime - reportTime) / 36e5;
                console.log(`reportHoursElapsed for ${req.params.id} is ${reportHoursElapsed}`);

                // Only scan it if 24hrs have elapsed
                if ( reportHoursElapsed < 24 ){
                    console.log(`Queue added for image ID ${req.params.id}...`);
                    scanQueue[req.params.id] = {
                        'image_id' : req.params.id,
                        'queued' : new Date()
                    };
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

    // Otherwise scanning has halted
    }else{
        console.log('Scanning has been HALTED.');
        console.log('Current queue and status:');
        console.log(scanQueue);
        console.log(scanStatus);
        return res.status(409).send();
    }
});

// Dequeue image ID
app.post('/dequeue/:id', bodyParser.json({limit: '50mb'}), (req, res) => {
    console.log(`Incoming POST Dequeue for image ID ${req.params.id}...`);

    // If the image ID exists in the queue, then remove it
    if ( req.params.id in scanQueue ){
        console.log(`Removing queue for image ID ${req.params.id}...`);
        delete scanQueue[req.params.id];
        return res.status(204).send();

    // Otherwise it does not exist, this was an invalid request
    }else{
        console.log(`No queue for image ID ${req.params.id}...`);
        return res.status(412).send();
    }
});

// Stop all image scans
app.post('/halt', (req, res) => {
    console.log('Incoming request to HALT all scanning.');
    console.log('Any scans currently being performed will finish.');
    console.log('No further scans will be allowed in the queue.');
    console.log('The current queue is:');
    console.log(scanQueue);
    changeScanStatus(false)
    .then(res.status(200).send())
    .catch(err => res.status(500).send(err));
});

// Resume all image scanning
app.post('/resume', (req, res) => {
    console.log('Incoming request to RESUME all scanning.');
    changeScanStatus(true)
    .then(res.status(200).send())
    .catch(err => res.status(500).send(err));
});

// Get current image scanning status
app.get('/status', (req, res) => {
    console.log(`Incoming GET for entire scanning status`);
    return res.status(200).send(scanStatus);
});

init();

