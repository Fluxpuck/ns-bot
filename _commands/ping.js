//construct requirements
const botconfig = require("../_config/bot_config.json")
const embed = require("../_config/embed.json")
const functions = require('../_config/functions');
const Discord = require("discord.js");

//client requirements
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {

    //fetch user's message and delete
    // let lastmsg = message.channel.lastMessageID
    // message.channel.fetchMessage(lastmsg).then(msg => msg.delete(4000));

    //sending and editting ping message
    return message.channel.send("Pinging ...")
        .then((msg) => {
            msg.edit("Pong response! \n`Sero - " + Math.round((Date.now() - msg.createdTimestamp)) + "ms` \n`Discord - " + Math.round(client.ping) + "ms`")
        })

}

module.exports.help = {
    name: "ping"
}