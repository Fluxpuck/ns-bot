//construct requirements
const botconfig = require("../_config/bot_config.json")
const embed = require("../_config/embed.json")
const Discord = require("discord.js");

//client requirements
const client = new Discord.Client({ disableEveryone: true })

module.exports = {

    uptimeProcess: function uptimeProcess() {
        var s = process.uptime()
        var date = new Date(null);
        date.setSeconds(s);
        var uptime_bot = date.toISOString().substr(11, 8);
        return uptime_bot
    },

    secondsConverter: function secondsConverter(s) {
        s = Number(s);
        var h = Math.floor(s / 3600);
        var m = Math.floor(s % 3600 / 60);
        var hDisplay = h + " Hr, " + m + " Min"
        return hDisplay;
    },

    date: function date(date) {
        var monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];
        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();
        return day + ' ' + monthNames[monthIndex] + ' ' + year;
    },

    time: function time(t) {
        var time =
            ("0" + t.getHours()).slice(-2) + ":" +
            ("0" + t.getMinutes()).slice(-2);
        return time
    },

    capitalize: function capitalize(str) {
        return str.replace(
            /\w\S*/g,
            function (txt) {
                if (txt.charAt(0) == "'") {
                    return
                } else {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                }
            }
        );
    }

};