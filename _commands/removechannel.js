//construct requirements
const botconfig = require("../_config/bot_config.json")
const embed = require("../_config/embed.json")
const functions = require('../_config/functions');
const Discord = require("discord.js");
const fs = require('fs');

//client requirements
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {

    //permission handler
    if (!message.member.hasPermission("MANAGE_MESSAGES") || !message.author.id === botconfig.fluxID) {
        return message.channel.send("You've no access to this command!").then(msg => { msg.delete(4000) })
    }

    //open server defaultchannel JSON
    var dchannel = JSON.parse(fs.readFileSync("./_server/defaultchannel.json", "utf8"))

    //empty defaultchannel input
    dchannel[message.guild.id] = {
        defaultchannel: ""
    }

    let defaultchannel = dchannel[message.guild.id].defaultchannel

    //write empty defaultchannel to JSON
    fs.writeFile("./_server/defaultchannel.json", JSON.stringify(dchannel), (err) => {
        if (err) console.log(err)
    })

    //fetch user's message and delete
    // let lastmsg = message.channel.lastMessageID
    // message.channel.fetchMessage(lastmsg).then(msg => msg.delete(9000));
    return message.channel.send(">>> <#" + message.channel.id + "> has been removed as defaultchannel \n_Please note that the bot will be available in every channel now!_")

}

module.exports.help = {
    name: "removechannel"
}            
