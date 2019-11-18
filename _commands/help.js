//construct requirements
const botconfig = require("../_config/bot_config.json")
const embed = require("../_config/embed.json")
const functions = require('../_config/functions');
const Discord = require("discord.js");
const fs = require('fs');

//client requirements
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {

    //default prefix
    let defaultprefix = botconfig.default_prefix
    let prefixes = JSON.parse(fs.readFileSync("./_server/prefixes.json", "utf8"))
    if (!prefixes[message.guild.id]) {
        prefixes[message.guild.id] = {
            prefixes: defaultprefix
        };
    }
    let prefix = prefixes[message.guild.id].prefixes

    //message processor
    let messageArr = args.toString()
    let arg = functions.capitalize(messageArr)

    if (!args.length) {
        let help_embed = new Discord.RichEmbed()
            .setTitle("Help!")
            .setDescription("Haal de werkzaamheden of storingen op of plan een binnenlandse reis! Meer features zijn in ontwikkeling... Gebruik `" + prefix + "help [categorie]` voor meer informatie per catergorie.\nVoor vragen, bug-reports en updates join de [Sero Support](https://discord.gg/WcwNtAA) discord server!\n Standaard prefix voor Sero is " + defaultprefix + " \n_______________________________")
            .addField("SETUP", "`" + prefix + "setprefix []` \n`" + prefix + "setchannel []` \n`" + prefix + "removechannel []`", true)
            .addField("INFO", "`" + prefix + "info` \n `" + prefix + "server` \n `" + prefix + "uptime`", true)
            .addField("NS", "`" + prefix + "storing` \n`" + prefix + "werk` \n`" + prefix + "gepland` \n`" + prefix + "station [station]` \n`" + prefix + "plan [station] > [station]`", true)
            .setColor(embed.color)
        // .setThumbnail(client.user.avatarURL)
        // .setTimestamp()
        // .setFooter(client.user.username, client.user.avatarURL)

        return message.channel.send(help_embed)

    } else if (arg == "Setup") {
        let help_embed = new Discord.RichEmbed()
            .setTitle("Setup Commands")
            .setDescription("_______________________________")
            .addField("SETUP commands", "`" + prefix + "setprefix []` \n`" + prefix + "setchannel []` \n`" + prefix + "removechannel` \n_______________________________")
            .addField("" + prefix + "setprefix []", "Typ `" + prefix + "setprefix` gevolgd door het gewenste prefix ")
            .addField("" + prefix + "setchannel []", "Typ `" + prefix + "setchannel` gevolgd door de naam van het gewenste tekstkanaal")
            .addField("" + prefix + "removechannel", "Typ `" + prefix + "removechannel` om het standaard tekstkanaal te verwijderen. \nPasop! De bot is vervolgens in alle tekstkanalen te gebruiken. ")
            .setColor(embed.color)
            .setThumbnail(embed.avatar)
        // .setTimestamp()
        // .setFooter(client.user.username, client.user.avatarURL)

        return message.channel.send(help_embed)

    } else if (arg == "Info") {
        let help_embed = new Discord.RichEmbed()
            .setTitle("Info Commands")
            .setDescription("_______________________________")
            .addField("INFO commands", "`" + prefix + "info` \n`" + prefix + "server` \n_______________________________")
            .addField("" + prefix + "info", "Typ `" + prefix + "info` om informatie over de server op te halen")
            .addField("" + prefix + "server", "Typ `" + prefix + "server` om informatie over de bot op te halen")
            .setColor(embed.color)
            .setThumbnail(embed.avatar)
        // .setTimestamp()
        // .setFooter(client.user.username, client.user.avatarURL)

        return message.channel.send(help_embed)

    } else if (arg == "Ns") {
        let help_embed = new Discord.RichEmbed()
            .setTitle("NS Commands")
            .setDescription("_______________________________")
            .addField("NS commands", "`" + prefix + "storing` \n`" + prefix + "werk` \n `" + prefix + "gepland` \n`" + prefix + "plan [station] > [station]` \n_______________________________")
            .addField("" + prefix + "storing", "Typ `" + prefix + "storing` om de actuele situatie op het spoor in Nederland op te halen")
            .addField("" + prefix + "werk", "Typ `" + prefix + "werk` om de actuele werkzaamheden op het spoor in Nederland op te halen")
            .addField("" + prefix + "gepland", "Haal geplande werkzaamheden op door `" + prefix + "gepland` te typen! \nLetop, dit is een bericht met meerdere pagina's")
            .addField("" + prefix + "station [station]", "Haal de huidige vertrektijden per station op door `" + prefix + "station` gevolgd door het vertrek station `[station]` ")
            .addField("" + prefix + "plan [station] > [station]", "Om een reis te plannen, typ `" + prefix + "plan` gevold door het vertrek station `[station]` een ` > ` en het gewenste aankomst station `[station]`")
            .setColor(embed.color)
            .setThumbnail(embed.avatar)
        // .setTimestamp()
        // .setFooter(client.user.username, client.user.avatarURL)

        return message.channel.send(help_embed)

    }
}

module.exports.help = {
    name: "help"
}