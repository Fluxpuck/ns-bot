const botconfig = require("../botconfig.json")
const request = require("request");
const Discord = require("discord.js")
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {

    //sending and editting Ping message
    message.channel.send("Uptime ophalen ...")
        .then((msg) => {

            var options = {
                method: 'POST',
                url: 'https://api.uptimerobot.com/v2/getMonitors',
                headers:
                {
                    'cache-control': 'no-cache',
                    'content-type': 'application/json',
                    'monitor': process.env.UPTIMEROBOTID
                },
                form: { api_key: process.env.UPTIMEROBOTKEY, format: 'json', logs: '1' }
            };

            request(options, function (error, response, body) {
                if (error) throw new Error(error);

                let uptimeJSON = JSON.parse(body)
                let monitor = uptimeJSON.monitors[0]
                let duration = monitor.logs[0].duration
                let uptime = secondsConverter(duration)

                msg.edit("Totaal is de uptime " + uptime)

            });

        })

}

module.exports.help = {
    name: "uptime"
}





//convert seconds to hours + mins
function secondsConverter(s) {
    s = Number(s);
    var h = Math.floor(s / 3600);
    var m = Math.floor(s % 3600 / 60);
    var hDisplay = h + " uur, " + m + " min"
    return hDisplay;
}

