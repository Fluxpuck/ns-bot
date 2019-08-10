const botconfig = require("../botconfig.json")
const defaultconfig = require("../_server/default-config.json")
const request = require("request");
const Discord = require("discord.js")
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {
  
    //only allow admins & bot-owner to setup bot
    if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You've no access to this command.")
    else if (!message.author.id == process.env.FLUXID) return console.log("NO ACCESS)")

    let defaultprefix = botconfig.prefix

    var options = {
        method: 'GET',
        url: 'https://ns-bot-v2.glitch.me/ns-bot/prefix',
        headers:
        {
            'x-key': process.env.MY_SECRET
        },
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        let prefixes = JSON.parse(body)
        if (!prefixes[message.guild.id]) {
            prefixes[message.guild.id] = {
                prefixes: defaultprefix
            };
        }
        let prefix = prefixes[message.guild.id].prefixes

        message.channel.send("Servers Prefix is " + prefix)

    });

}

module.exports.help = {
    name: "prefix"
}