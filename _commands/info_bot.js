//construct requirements
const botconfig = require("../_config/bot_config.json")
const embed = require("../_config/embed.json")
const functions = require('../_config/functions');
const request = require("request");
const Discord = require("discord.js");

//client requirements
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {

    //permission handler
    if (!message.member.hasPermission("MANAGE_MESSAGES") || !message.author.id === botconfig.fluxID) {
        return message.channel.send("⛔ You've no access to this command!").then(msg => { msg.delete(4000) })
    }

    //bot information embedded message
    let info_embed = new Discord.RichEmbed()
        .setTitle("Bot information")
        .addField("Name", client.user, true)
        .addField("Version", botconfig.version, true)
        .addField("Servers", client.guilds.size, true)
        .addField("Developer", "Fluxpuck#9999\n", true)
        .setColor(embed.color)
        .setThumbnail(embed.avatar)
        .setTimestamp()
        .setFooter(client.user.username, embed.icon)

    //setup uptime robot request
    var options = {
        method: 'POST',
        url: 'https://api.uptimerobot.com/v2/getMonitors',
        headers:
        {
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded'
        },
        form: { api_key: process.env.UPTIMEROBOT_TOKEN, format: 'json', logs: '1' }
    };

    //request total uptime from uptimerobot API
//     request(options, function (error, response, body) {
//         if (error) throw new Error(error);

//         //parse all fetched JSON data
//         let uptimeJSON = JSON.parse(body)

//         //loop through all data
//         let monitors = uptimeJSON.monitors
//         for (i in monitors) {
//             let monitor = monitors[i]
//             let name = monitor.friendly_name

//             //select correct uptimerobot monitor
//             if (name === process.env.UPTIMEROBOT_NAME) {
//                 let duration = monitor.logs[0].duration
//                 let uptime = functions.secondsConverter(duration)
//                 //add uptime from uptimerobot API
//                 info_embed.addField("Uptime", uptime, true)
//                 //send bot information embed
//                 return message.channel.send(info_embed)
//             }
//         }

//     });
  
  return message.channel.send(info_embed)

}

module.exports.help = {
    name: "info"
}