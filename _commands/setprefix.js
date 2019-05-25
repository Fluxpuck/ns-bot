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
            // .setThumbnail(client.user.avatarURL)
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL)

        message.channel.send(setprefix_embed)

    }

}

module.exports.help = {
    name: "setprefix"
}            
