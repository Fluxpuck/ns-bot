const botconfig = require("../botconfig.json")
const defaultconfig = require("../_server/default-config.json")
const request = require("request");
const Discord = require("discord.js")
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {
  
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
        
        var time = new Date().getTime();
        var date = new Date(time);

        console.log("[" + message.guild.id + "] " + message.guild.name + " fetched prefix at " + date)
        message.channel.send("**Hello!** My current prefix is `" + prefix + "`")

    });

}

module.exports.help = {
    name: "prefix_0"
}
