const botconfig = require("../botconfig.json")
const defaultconfig = require("../_server/default-config.json")
const Discord = require("discord.js")
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {
  
    //only allow admins & bot-owner to setup bot
    if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You've no access to this command.")
    if (!message.sender === process.env.FLUXID) return message.channel.send("You have no access to this command.")

    //Get Client IP => DO curl ifconfig.co IN CONSOLE TO GET IP
    require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    console.log('addr: '+add);
    })
  
    // curl ipconfig.co

}

module.exports.help = {
    name: "debug"
}



