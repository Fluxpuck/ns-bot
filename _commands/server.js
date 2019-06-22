const botconfig = require("../botconfig.json")
const defaultconfig = require("../_server/default-config.json")
const Discord = require("discord.js")
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {

    let serverinfo_embed = new Discord.RichEmbed()
        .setTitle("Server informatie")
        .setDescription(message.guild.name)
        .addField("Server Eigenaar", message.guild.owner, true)
        .addField("Totaal Gebruikers", message.guild.memberCount, true)
        .addField("Server Regio", message.guild.region, true)
        .addField("Aangemaakt op", date(message.guild.createdAt), true)
        .setThumbnail(message.guild.iconURL)
        .setColor(defaultconfig.embed_color)
        .setTimestamp()
        .setFooter(client.user.username, defaultconfig.embed_emblem)

    return message.channel.send(serverinfo_embed)

}

module.exports.help = {
    name: "server"
}





// ============== functions =>

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