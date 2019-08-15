//construct bot requirements
const botconfig = require("./botconfig.json");
const fs = require('fs');
const morgan = require('morgan');
const express = require('express');
var path = require('path');

var routes = function (app) {
  
    // create a write stream (in append mode)
    var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

    // adding morgan to log HTTP requests
    app.use(morgan(botconfig.morgan))

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

    //ns-bot API prefix
    app.get('/ns-bot/prefix', (req, res) => {
        if (!req.header('x-key')) {
            return res.send({ "message": "Forbidden" });
        } else if (req.header('x-key') == process.env.MY_SECRET) {
            let prefixes = JSON.parse(fs.readFileSync("./_server/prefixes.json", "utf8"))
            return res.send(prefixes);
        } else {
            return res.send({ "message": "Wrong key" });
        }
    });

    app.post("/ns-bot/prefix", function (req, res) {
        if (!req.header('x-key')) {
            return res.send({ "message": "Forbidden" });
        } else if (req.header('Content-Type') == 'application/json' || req.header('x-key') == process.env.MY_SECRET) {

            // if input doesn't contain server and prefix, decline post
            if (!req.body.server || !req.body.prefixes) { return res.send({ status: 'DECLINED', message: 'BAD INPUT' }) }

            let input_serverID = req.body.server
            let input_prefix = req.body.prefixes

            //parse JSON, edit prefixes, write file
            let prefixes = JSON.parse(fs.readFileSync("./_server/prefixes.json", "utf8"))
            prefixes[input_serverID] = {
                prefixes: input_prefix
            }
            fs.writeFile("./_server/prefixes.json", JSON.stringify(prefixes), (err) => {
                if (err) console.log(err)
                if (err) return res.send({ status: 'ERROR' })
            })
            return res.send({ status: 'SUCCESS' });
        } else {
            return res.send({ "message": "Wrong key" });
        }
    });

    //ns-bot API defaultchannel
    app.get('/ns-bot/defaultchannel', (req, res) => {
        if (!req.header('x-key')) {
            return res.send({ "message": "Forbidden" });
        } else if (req.header('x-key') == process.env.MY_SECRET) {
            let prefixes = JSON.parse(fs.readFileSync("./_server/defaultchannel.json", "utf8"))
            return res.send(prefixes);
        } else {
            return res.send({ "message": "Wrong key" });
        }
    });

    app.post("/ns-bot/defaultchannel", function (req, res) {
        if (!req.header('x-key')) {
            return res.send({ "message": "Forbidden" });
        } else if (req.header('Content-Type') == 'application/json' || req.header('x-key') == process.env.MY_SECRET) {

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
                if (err) return res.send({ status: 'ERROR' })
            })
            return res.send({ status: 'SUCCESS' });
        } else {
            return res.send({ "message": "Wrong key" });
        }
    });

  
    // curl -G https://ns-bot-v2.glitch.me/ns-bot/prefix -H "x-key: jtpgW5KG72rqQx2N"
    // curl -G https://ns-bot-v2.glitch.me/ns-bot/defaultchannel -H "x-key: jtpgW5KG72rqQx2N"
    // curl -d "{"server":"565104867002155008","prefixes":">"}" -H "Content-Type: application/json" -X POST https://ns-bot-v2.glitch.me/ns-bot/prefix -H "x-key: jtpgW5KG72rqQx2N"
    // curl -d '{"server":"565104867002155008","defaultchannel":"580000255173722112"}' -H "Content-Type: application/json" -X POST https://ns-bot-v2.glitch.me/ns-bot/defaultchannel -H "x-key: jtpgW5KG72rqQx2N"

};

module.exports = routes;