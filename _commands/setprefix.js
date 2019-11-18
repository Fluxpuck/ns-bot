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
        return message.channel.send("⛔ You've no access to this command!").then(msg => { msg.delete(4000) })
    }

    //check if input is correct
    if (!args.length) return message.channel.send("❗ `Please enter a prefix`").then(msg => { msg.delete(8000) })
    if (args.length > 1) return message.channel.send("❗ `Please enter a prefix, without any spaces`").then(msg => { msg.delete(8000) })

    //set custom server prefix
    else {

        //open server prefix JSON
        let prefixes = JSON.parse(fs.readFileSync("./_server/prefixes.json", "utf8"))

        //set custom server prefix with admin input
        prefixes[message.guild.id] = {
            prefixes: args[0]
        }

        //write custom server prefix to JSON
        fs.writeFile("./_server/prefixes.json", JSON.stringify(prefixes), (err) => {
            if (err) console.log(err)
        })

        //fetch user's message and delete
        // let lastmsg = message.channel.lastMessageID
        // message.channel.fetchMessage(lastmsg).then(msg => msg.delete(9000));
        return message.channel.send(">>> Sero's prefix is now set to: `" + args[0] + "`")

    }

}

module.exports.help = {
    name: "setprefix"
}
