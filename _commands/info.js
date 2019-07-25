const botconfig = require("../botconfig.json")
const defaultconfig = require("../_server/default-config.json")
const request = require("request");
const Discord = require("discord.js")
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {

    //info variables
    let guildcount = client.guilds.size
    let versioncontrol = botconfig.version

    let info_embed = new Discord.RichEmbed()
        .setTitle("Bot Informatie")
        .setDescription(client.user.tag)
        .addField("Versie", versioncontrol, true)
        .addField("Servers", guildcount, true)
        .addField("Toegevoegd op", date(message.guild.joinedAt), true)
        .addField("Huidige Uptime", uptimeProcess(), true)
        .addField("Developer", "Fluxpuck#9999\n", true)
        .setColor(defaultconfig.embed_color)
        .setThumbnail(defaultconfig.embed_avatar)
        .setTimestamp()
        .setFooter(client.user.username, defaultconfig.embed_emblem)

    var options = {
        method: 'POST',
        url: 'https://api.uptimerobot.com/v2/getMonitors',
        headers:
        {
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded'
        },
        form: { api_key: process.env.UPTIMEROBOTKEY, format: 'json', logs: '1' }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        let uptimeJSON = JSON.parse(body)

        let monitors = uptimeJSON.monitors
        for (i in monitors) {
            let monitor = monitors[i]
            let name = monitor.friendly_name

            if (name === process.env.BOTNAME) {
                let datetime = monitor.logs[0].datetime
                let uptime = timeConversion(datetime)

                info_embed.addField("Totale Uptime", uptime, true)

                message.channel.send(info_embed)

            }
        }

    });

}

module.exports.help = {
    name: "info"
}




// ============== functions =>

//process uptimeProcess
function uptimeProcess() {
    var s = process.uptime()
    var date = new Date(null);
    date.setSeconds(s);
    var uptime_bot = date.toISOString().substr(11, 8);
    return uptime_bot
}

//convert date
function date(date) {
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
}

//convert date to hours
function timeConversion(millisec) {
    var seconds = (millisec / 1000).toFixed(0);
    var minutes = (millisec / (1000 * 60)).toFixed(0);
    var hours = (millisec / (1000 * 60 * 60)).toFixed(0);
    if (seconds < 60) {
        return seconds + " Sec";
    } else if (minutes < 60) {
        return minutes + " Min";
    } else {
        return hours + " Uur";
    }
}