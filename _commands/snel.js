const botconfig = require("../botconfig.json")
const defaultconfig = require("../_server/default-config.json")
var mysql = require('mysql');
const Discord = require("discord.js")
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {

    //database connection
    var conn = mysql.createConnection({
        host: process.env.HOSTIP,
        user: process.env.DBLOGIN,
        password: process.env.DBPASSWORD,
        database: botconfig.db_select,
        port: botconfig.port
    });

    let db_trip = ""
    let msg = "`Je hebt nog niet voldoende opgeslagen reizen om deze snelkoppeling te gebruiken!`"

    if (args.lenght <= 0) {
        return
    } else if (args == 1) {

        conn.connect(function (err) {
            if (err) throw err;

            conn.query("SELECT * FROM train_history WHERE user = " + message.author.id + " ORDER BY ID DESC", function (err, result, fields) {
                if (err) throw err;

                let results = result[(args - 1)]

                if (!results) {
                    message.channel.send(msg)
                } else {
                    db_trip = results.trip
                    let commandfile = client.commands.get("plan");
                    if (commandfile) commandfile.run(client, message, db_trip);
                }
            });
        });

    } else if (args == 2) {

        conn.connect(function (err) {
            if (err) throw err;

            conn.query("SELECT * FROM train_history WHERE user = " + message.author.id + " ORDER BY ID DESC", function (err, result, fields) {
                if (err) throw err;

                let results = result[(args - 1)]

                if (!results) {
                    message.channel.send(msg)
                } else {
                    db_trip = results.trip
                    let commandfile = client.commands.get("plan");
                    if (commandfile) commandfile.run(client, message, db_trip);
                }
            });
        });

    } else if (args == 3) {

        conn.connect(function (err) {
            if (err) throw err;

            conn.query("SELECT * FROM train_history WHERE user = " + message.author.id + " ORDER BY ID DESC", function (err, result, fields) {
                if (err) throw err;

                let results = result[(args - 1)]

                if (!results) {
                    message.channel.send(msg)
                } else {
                    db_trip = results.trip
                    let commandfile = client.commands.get("plan");
                    if (commandfile) commandfile.run(client, message, db_trip);
                }
            });
        });

    } else if (args == 4) {

        conn.connect(function (err) {
            if (err) throw err;

            conn.query("SELECT * FROM train_history WHERE user = " + message.author.id + " ORDER BY ID DESC", function (err, result, fields) {
                if (err) throw err;

                let results = result[(args - 1)]

                if (!results) {
                    message.channel.send(msg)
                } else {
                    db_trip = results.trip
                    let commandfile = client.commands.get("plan");
                    if (commandfile) commandfile.run(client, message, db_trip);
                }
            });
        });

    } else if (args == 5) {

        conn.connect(function (err) {
            if (err) throw err;

            conn.query("SELECT * FROM train_history WHERE user = " + message.author.id + " ORDER BY ID DESC", function (err, result, fields) {
                if (err) throw err;

                let results = result[(args - 1)]

                if (!results) {
                    message.channel.send(msg)
                } else {
                    db_trip = results.trip
                    let commandfile = client.commands.get("plan");
                    if (commandfile) commandfile.run(client, message, db_trip);
                }

            });
        });

    } else {
        message.channel.send("`Doe !lijst voor jouw beschikbare snel-reizen (1 t/m 5)!`")
    }  
  
}

module.exports.help = {
    name: "snel"
}