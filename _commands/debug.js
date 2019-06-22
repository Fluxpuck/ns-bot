const botconfig = require("../botconfig.json")
const defaultconfig = require("../_server/default-config.json")
const Discord = require("discord.js")
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {

    //Get Client IP => DO curl ifconfig.co IN CONSOLE TO GET IP
    require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    console.log('addr: '+add);
    })
  
    // curl ipconfig.co

}

module.exports.help = {
    name: "debug"
}



