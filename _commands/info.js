const botconfig = require("../botconfig.json")
const defaultconfig = require("../_server/default-config.json")
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
        .addField("Developer", "Fluxpuck#9999\n")
        .setColor(defaultconfig.embed_color)
        .setThumbnail(client.user.avatarURL)
        .setTimestamp()
        .setFooter(client.user.username, defaultconfig.embed_emblem)

    return message.channel.send(info_embed)

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