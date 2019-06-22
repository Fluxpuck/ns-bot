const botconfig = require("../botconfig.json")
const defaultconfig = require("../_server/default-config.json")
const Discord = require("discord.js")
const fs = require('fs');
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {

    //parse JSON, edit defaultchannel, write file
    var dchannel = JSON.parse(fs.readFileSync("./_server/defaultchannel.json", "utf8"))

    dchannel[message.guild.id] = {
        defaultchannel: ""
    }

    fs.writeFile("./_server/defaultchannel.json", JSON.stringify(dchannel), (err) => {
        if (err) console.log(err)
    })

    let removechannel_embed = new Discord.RichEmbed()
        .setTitle("Default channel is removed!")
        .setDescription("Please note that the bot will be available in every channel now")
        .setColor(defaultconfig.embed_color)
        // .setThumbnail(defaultconfig.embed_avatar)
        .setTimestamp()
        .setFooter(client.user.username, defaultconfig.embed_emblem)

    message.channel.send(removechannel_embed)

}

module.exports.help = {
    name: "removechannel"
}            
