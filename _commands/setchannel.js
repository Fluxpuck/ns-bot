const botconfig = require("../botconfig.json")
const defaultconfig = require("../_server/default-config.json")
const Discord = require("discord.js")
const fs = require('fs');
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {

    if (!args.length) {
        message.channel.send("Please enter a prefix")
    } else {

        //only allow admins to setup bot
        if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You've no access to this command.")

        //get channel.id by name
        var dfch = message.guild.channels.find(channel => channel.name === args[0]);
        let dc = dfch.id

        //parse JSON, edit defaultchannel, write file
        var dchannel = JSON.parse(fs.readFileSync("./_server/defaultchannel.json", "utf8"))

        dchannel[message.guild.id] = {
            defaultchannel: dc
        }

        fs.writeFile("./_server/defaultchannel.json", JSON.stringify(dchannel), (err) => {
            if (err) console.log(err)
        })

        let setchannel_embed = new Discord.RichEmbed()
            .setTitle("Default channel is changed!")
            .setDescription("Default channel is now set to " + args[0])
            .setColor(defaultconfig.embed_color)
            // .setThumbnail(client.user.avatarURL)
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL)

        message.channel.send(setchannel_embed)

    }

}

module.exports.help = {
    name: "setchannel"
}            
