const botconfig = require("../botconfig.json")
const defaultconfig = require("../_server/default-config.json")
const Discord = require("discord.js")
const fs = require('fs');
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {

    //only allow admins & bot-owner to setup bot
    if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You've no access to this command.")
    if (!message.sender === process.env.FLUXID) return message.channel.send("You have no access to this command.")

    //message processor
    let messageArr = args.toString()
    let channelNum, channelStr
    if (messageArr.includes("#")) { channelNum = messageArr.replace('<', '').replace('#', '').replace('>', '') }
    else { channelStr = messageArr }

    //get set-to-channel
    let dft_channel, dft
    if (channelNum) {
        dft_channel = message.guild.channels.get(channelNum)
        if (!dft_channel) { }
        else { dft = dft_channel.id }
    } else if (channelStr) {
        dft_channel = message.guild.channels.find(channel => channel.name === channelStr)
        if (!dft_channel) { }
        else { dft = dft_channel.id }
    }

    if (!args.length) { return message.channel.send("Selecteer een tekstkanaal.") }
    else {

        if (!dft_channel || !dft) { return message.channel.send("Er is geen tekstkanaal gevonden met deze naam!") }

        //parse JSON, edit defaultchannel, write file
        var dchannel = JSON.parse(fs.readFileSync("./_server/defaultchannel.json", "utf8"))
        dchannel[message.guild.id] = {
            defaultchannel: dft
        }
        fs.writeFile("./_server/defaultchannel.json", JSON.stringify(dchannel), (err) => {
            if (err) console.log(err)
        })

        let setchannel_embed = new Discord.RichEmbed()
            .setTitle("Default channel is changed!")
            .setDescription("Default channel is now set to <#" + dft + ">")
            .setColor(defaultconfig.embed_color)
            // .setThumbnail(client.user.avatarURL)
            .setTimestamp()
            .setFooter(client.user.username, botconfig.embed_emblem)

        message.channel.send(setchannel_embed)

    }

}

module.exports.help = {
    name: "setchannel"
} 