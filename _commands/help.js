const botconfig = require("../botconfig.json")
const defaultconfig = require("../_server/default-config.json")
const Discord = require("discord.js")
const fs = require('fs');
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {
  
    //default prefix
    let prefixes = JSON.parse(fs.readFileSync("./_server/prefixes.json", "utf8"))
    let prefix = prefixes[message.guild.id].prefixes

     if (!args.length) {
        let help_embed = new Discord.RichEmbed()
            .setTitle("Help!")
            .setDescription("Haal de werkzaamheden of storingen op of plan een binnenlandse reis! Meer features zijn in ontwikkeling... Gebruik `!help [categorie]` voor meer informatie per catergorie. Standaard prefix is `!` \n_______________________________")
            .addField("SETUP", "`!setprefix []` \n`!setchannel []` \n`!removechannel []`", true)
            .addField("INFO", "`!info` \n`!server`", true)
            .addField("NS", "`!storing` \n`!werk` \n`!gepland` \n`!plan [station] > [station]` \n`!lijst` \n`!snel [1-5]`", true)
            .setColor(defaultconfig.embed_color)
        // .setThumbnail(client.user.avatarURL)
        // .setTimestamp()
        // .setFooter(client.user.username, client.user.avatarURL)

        return message.channel.send(help_embed)

    } else if (args == "setup") {
        let help_embed = new Discord.RichEmbed()
            .setTitle("Setup Commands")
            .setDescription("_______________________________")
            .addField("SETUP commands", "`!setprefix []` \n`!setchannel []` \n`!removechannel` \n_______________________________")
            .addField("!setprefix []", "Typ `!setprefix` gevolgd door het gewenste prefix ")
            .addField("!setchannel []", "Typ `!setchannel` gevolgd door de naam van het gewenste tekstkanaal")
            .addField("!removechannel", "Typ `!removechannel` om het standaard tekstkanaal te verwijderen. \nPasop! De bot is vervolgens in alle tekstkanalen te gebruiken. ")
            .setColor(defaultconfig.embed_color)
        // .setThumbnail(client.user.avatarURL)
        // .setTimestamp()
        // .setFooter(client.user.username, client.user.avatarURL)

        return message.channel.send(help_embed)

    } else if (args == "info") {
        let help_embed = new Discord.RichEmbed()
            .setTitle("Info Commands")
            .setDescription("_______________________________")
            .addField("INFO commands", "`!info` \n`!server` \n_______________________________")
            .addField("!server", "Typ `!server` om informatie over de bot op te halen")
            .addField("!info", "Typ `!info` om informatie over de server op te halen")
            .setColor(defaultconfig.embed_color)
        // .setThumbnail(client.user.avatarURL)
        // .setTimestamp()
        // .setFooter(client.user.username, client.user.avatarURL)

        return message.channel.send(help_embed)

    } else if (args == "ns") {
        let help_embed = new Discord.RichEmbed()
            .setTitle("NS Commands")
            .setDescription("_______________________________")
            .addField("NS commands", "`!storing` \n`!werk` \n`!plan [station] > [station]` \n `!lijst` \n_______________________________")
            .addField("!storing", "Typ `!storing` om de actuele situatie op het spoor in Nederland op te halen")
            .addField("!werk", "Typ `!werk` om de actuele werkzaamheden op het spoor in Nederland op te halen")
            .addField("!gepland", "Haal geplande werkzaamheden op door `!gepland` te typen! \nLetop, dit is een bericht met meerdere pagina's")
            .addField("!plan [station] > [station]", "Om een reis te plannen, typ `!plan` gevold door het vertrek station `[station]` een ` > ` en het gewenste aankomst station `[station]`")
            .addField("!lijst", "Typ `!lijst` om jouw reis-geschiedenis op te halen. \nHiermee kun je eenvoudig de reis herplannen")
            .addField("!snel [1-5]", "Om een eerdere reis opniew te plannen, haal de `!lijst` op en typ vervolgens `!snel` gevolgd door het nummer voor de reis uit jouw reis-geschiedenis")
            .setColor(defaultconfig.embed_color)
        // .setThumbnail(defaultconfig.embed_avatar)
        // .setTimestamp()
        // .setFooter(client.user.username, client.user.avatarURL)

        return message.channel.send(help_embed)

    }

}

module.exports.help = {
    name: "help"
}