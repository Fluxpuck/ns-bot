const botconfig = require("../botconfig.json")
const defaultconfig = require("../_server/default-config.json")
const Discord = require("discord.js")
const fs = require('fs');
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {
  
    //only allow admins & bot-owner to setup bot
    if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You've no access to this command.")
    if (!message.sender === process.env.FLUXID) return message.channel.send("You have no access to this command.")

    if (!args.length) {
        message.channel.send("Please enter a prefix")
    } else {

        //parse JSON, edit prefixes, write file
        let prefixes = JSON.parse(fs.readFileSync("./_server/prefixes.json", "utf8"))

        prefixes[message.guild.id] = {
            prefixes: args[0]
        }

        fs.writeFile("./_server/prefixes.json", JSON.stringify(prefixes), (err) => {
            if (err) console.log(err)
        })

        let setprefix_embed = new Discord.RichEmbed()
            .setTitle("Prefix is changed:")
            .setDescription("Prefix is now set to " + args[0])
            .setColor(defaultconfig.embed_color)
            // .setThumbnail(defaultconfig.embed_avatar)
            .setTimestamp()
            .setFooter(client.user.username, defaultconfig.embed_emblem)

        message.channel.send(setprefix_embed)

    }

}

module.exports.help = {
    name: "setprefix"
}            
