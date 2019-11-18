//construct requirements
const botconfig = require("../_config/bot_config.json")
const embed = require("../_config/embed.json")
const functions = require('../_config/functions');
const fs = require('fs');
const morgan = require('morgan');
const express = require('express');
const path = require('path')



const routes = function (app) {

    // create a write stream (in append mode)
    var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

    // adding morgan to log HTTP requests
    app.use(morgan(botconfig.morgan, {
        stream: accessLogStream
    }))

    // JSON parser
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // defining endpoint to return
    app.get('/', (req, res) => {
        if (req.header('x-key')) {
            res.send({ "message": "Nothing to see here" })
        } else {
            res.send({ "message": "You need an authentication key" })
        }
    });

    //ns-bot API server-list
    app.get('/ns-bot/serverlist', (req, res) => {
        if (!req.header('x-key')) {
            return res.send({ "message": "Forbidden" });
        } else if (req.header('x-key') == botconfig.my_secret) {

            try {

                let serverlistJSON = JSON.parse(fs.readFileSync("./_server/sero_serverlist.json", "utf8"))
                return res.send(serverlistJSON);

            } catch (err) {
                console.log("Error message in restAPI " + Date.now() + " - " + err.message)
                return res.send({ status: 'ERROR' });
            }

        } else {
            return res.send({ "message": "Wrong key" });
        }
    });

    //ns-bot API command-list
    app.get('/ns-bot/commandlist', (req, res) => {
        if (!req.header('x-key')) {
            return res.send({ "message": "Forbidden" });
        } else if (req.header('x-key') == botconfig.my_secret) {

            try {

                let commandlistJSON = JSON.parse(fs.readFileSync("./_server/sero_commandlist.json", "utf8"))
                return res.send(commandlistJSON);

            } catch (err) {
                console.log("Error message in restAPI " + Date.now() + " - " + err.message)
                return res.send({ status: 'ERROR' });
            }

        } else {
            return res.send({ "message": "Wrong key" });
        }
    });

    //ns-bot API prefix
    app.get('/ns-bot/prefix', (req, res) => {
        if (!req.header('x-key')) {
            return res.send({ "message": "Forbidden" });
        } else if (req.header('x-key') == botconfig.my_secret) {

            try {

                let prefixes = JSON.parse(fs.readFileSync("./_server/prefixes.json", "utf8"))

                let prefixArray = []

                for (i in prefixes) {

                    prefixArray.push({
                        "serverID": i,
                        "prefix": prefixes[i].prefixes
                    })

                }

                return res.send(prefixArray);

            } catch (err) {
                console.log("Error message in restAPI " + Date.now() + " - " + err.message)
                return res.send({ status: 'ERROR' });
            }

        } else {
            return res.send({ "message": "Wrong key" });
        }
    });

    app.post("/ns-bot/prefix", function (req, res) {
        if (!req.header('x-key')) {
            return res.send({ "message": "Forbidden" });
        } else if (req.header('Content-Type') == 'application/json' || req.header('x-key') == botconfig.my_secret) {

            try {

                // if input doesn't contain server and prefix, decline post
                if (!req.body.server || !req.body.prefix) { return res.send({ status: 'DECLINED', message: 'BAD INPUT' }) }

                let input_serverID = req.body.server
                let input_prefix = req.body.prefix

                //parse JSON, edit prefixes, write file
                let prefixes = JSON.parse(fs.readFileSync("./_server/prefixes.json", "utf8"))

                prefixes[input_serverID] = {
                    prefixes: input_prefix
                }

                fs.writeFile("./_server/prefixes.json", JSON.stringify(prefixes), (err) => {
                    if (err) console.log(err)
                })

                console.log("prefix of server " + input_serverID + " has been set to: " + input_prefix)

                return res.send({ status: 'SUCCESS' });

            } catch (err) {
                console.log("Error message in restAPI " + Date.now() + " - " + err.message)
                return res.send({ status: 'ERROR' });
            }


        } else {
            return res.send({ "message": "Wrong key" });
        }
    });

    //ns-bot API defaultchannel
    app.get('/ns-bot/defaultchannel', (req, res) => {
        if (!req.header('x-key')) {
            return res.status(403).send({ "message": "Forbidden" });
        } else if (req.header('x-key') == botconfig.my_secret) {

            try {

                let defaulchannel = JSON.parse(fs.readFileSync("./_server/defaultchannel.json", "utf8"))

                let defaultchannelArray = []

                for (i in defaulchannel) {

                    defaultchannelArray.push({
                        "serverID": i,
                        "defaultchannel": defaulchannel[i].defaultchannel
                    })

                }

                return res.send(defaultchannelArray);

            } catch (err) {
                console.log("Error message in restAPI " + Date.now() + " - " + err.message)
                return res.send({ status: 'ERROR' });
            }

        } else {
            return res.send({ "message": "Wrong key" });
        }
    });

    app.post("/ns-bot/defaultchannel", function (req, res) {
        if (!req.header('x-key')) {
            return res.send({ "message": "Forbidden" });
        } else if (req.header('Content-Type') == 'application/json' || req.header('x-key') == botconfig.my_secret) {

            try {

                // if input doesn't contain server and prefix, decline post
                if (!req.body.server || !req.body.defaultchannel) { return res.send({ status: 'DECLINED', message: 'BAD INPUT' }) }

                let input_serverID = req.body.server
                let input_defaultchannel = req.body.defaultchannel

                //parse JSON, edit defaultchannel, write file
                let defaultchannel = JSON.parse(fs.readFileSync("./_server/defaultchannel.json", "utf8"))

                defaultchannel[input_serverID] = {
                    defaultchannel: input_defaultchannel
                }

                fs.writeFile("./_server/defaultchannel.json", JSON.stringify(defaultchannel), (err) => {
                    if (err) console.log(err)
                })

                console.log("defaultchannel of server " + input_serverID + " has been set to: " + input_defaultchannel)

                return res.send({ status: 'SUCCESS' });

            } catch (err) {
                console.log("Error message in restAPI " + Date.now() + " - " + err.message)
                return res.send({ status: 'ERROR' });
            }

        } else {
            return res.send({ "message": "Wrong key" });
        }
    });

};

module.exports = routes;