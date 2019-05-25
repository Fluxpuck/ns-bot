const Discord = require("discord.js")
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {

    // var ping = client.ping
    // message.channel.send(ping)

    //sending and editting Ping message
    return message.channel.send("Pinging ...")
        .then((msg) => {
            msg.edit("Pong! " + (Date.now() - msg.createdTimestamp) + "ms \nGem. ping is " + Math.round(client.ping) + "ms")
        })

}

module.exports.help = {
    name: "ping"
}