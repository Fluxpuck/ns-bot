//construct requirements
const botconfig = require("../_config/bot_config.json")
const embed = require("../_config/embed.json")
const functions = require('../_config/functions');
const Discord = require("discord.js");

//client requirements
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {

    //permission handler
    if (!message.member.hasPermission("MANAGE_MESSAGES") || !message.author.id === botconfig.fluxID) {
        return message.channel.send("⛔ You've no access to this command!").then(msg => { msg.delete(4000) })
    }

    //server information embedded message
    let serverinfo_embed = new Discord.RichEmbed()
        .setTitle("Server information")
        .addField("Server", message.guild.name, true)
        .addField("Users", message.guild.memberCount, true)
        .addField("Bots", message.guild.members.filter(member => member.user.bot).size, true)
        .addField("Owner", message.guild.owner, true)
        .addField("Region", message.guild.region, true)
        .addField("Creation", functions.date(message.guild.createdAt), true)
        .setThumbnail(message.guild.iconURL)
        .setColor(embed.color)
        .setTimestamp()
        .setFooter(client.user.username, embed.icon)

    return message.channel.send(serverinfo_embed)

}

module.exports.help = {
    name: "server"
}