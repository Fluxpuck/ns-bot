const botconfig = require("../botconfig.json")
const defaultconfig = require("../_server/default-config.json")
const Discord = require("discord.js")
const fs = require('fs');
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {
  
    //default prefix
    let prefixes = JSON.parse(fs.readFileSync("./_server/prefixes.json", "utf8"))
    let prefix = prefixes[message.guild.id].prefixes
    
    //message processor
    let messageArr = args.toString()
    let arg = capitalize(messageArr)

    if (!args.length) {
        let help_embed = new Discord.RichEmbed()
            .setTitle("Help!")
            .setDescription("Haal de werkzaamheden of storingen op of plan een binnenlandse reis! Meer features zijn in ontwikkeling... Gebruik `" + prefix + "help [categorie]` voor meer informatie per catergorie. Standaard prefix voor deze server is `" + prefix + "` \n_______________________________")
            .addField("SETUP", "`" + prefix + "setprefix []` \n`" + prefix + "setchannel []` \n`" + prefix + "removechannel []`", true)
            .addField("INFO", "`" + prefix + "info` \n `" + prefix + "server`", true)
            .addField("NS", "`" + prefix + "storing` \n`" + prefix + "werk` \n`" + prefix + "gepland` \n`" + prefix + "plan [station] > [station]` \n`" + prefix + "lijst` \n`" + prefix + "snel [1-5]`", true)
            .setColor(defaultconfig.embed_color)
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
            .setColor(defaultconfig.embed_color)
            .setThumbnail(defaultconfig.embed_avatar)
        // .setTimestamp()
        // .setFooter(client.user.username, client.user.avatarURL)

        return message.channel.send(help_embed)

    } else if (arg == "Info") {
        let help_embed = new Discord.RichEmbed()
            .setTitle("Info Commands")
            .setDescription("_______________________________")
            .addField("INFO commands", "`" + prefix + "info` \n`" + prefix + "server` \n_______________________________")
            .addField("" + prefix + "server", "Typ `" + prefix + "server` om informatie over de bot op te halen")
            .addField("" + prefix + "info", "Typ `" + prefix + "info` om informatie over de server op te halen")
            .setColor(defaultconfig.embed_color)
            .setThumbnail(defaultconfig.embed_avatar)
        // .setTimestamp()
        // .setFooter(client.user.username, client.user.avatarURL)

        return message.channel.send(help_embed)

    } else if (arg == "Ns") {
        let help_embed = new Discord.RichEmbed()
            .setTitle("NS Commands")
            .setDescription("_______________________________")
            .addField("NS commands", "`" + prefix + "storing` \n`" + prefix + "werk` \n`" + prefix + "plan [station] > [station]` \n `" + prefix + "lijst` \n_______________________________")
            .addField("" + prefix + "storing", "Typ `" + prefix + "storing` om de actuele situatie op het spoor in Nederland op te halen")
            .addField("" + prefix + "werk", "Typ `" + prefix + "werk` om de actuele werkzaamheden op het spoor in Nederland op te halen")
            .addField("" + prefix + "gepland", "Haal geplande werkzaamheden op door `" + prefix + "gepland` te typen! \nLetop, dit is een bericht met meerdere pagina's")
            .addField("" + prefix + "plan [station] > [station]", "Om een reis te plannen, typ `" + prefix + "plan` gevold door het vertrek station `[station]` een ` > ` en het gewenste aankomst station `[station]`")
            .addField("" + prefix + "lijst", "Typ `" + prefix + "lijst` om jouw reis-geschiedenis op te halen. \nHiermee kun je eenvoudig de reis herplannen")
            .addField("" + prefix + "snel [1-5]", "Om een eerdere reis opniew te plannen, haal de `" + prefix + "lijst` op en typ vervolgens `" + prefix + "snel` gevolgd door het nummer voor de reis uit jouw reis-geschiedenis")
            .setColor(defaultconfig.embed_color)
            .setThumbnail(defaultconfig.embed_avatar)
        // .setTimestamp()
        // .setFooter(client.user.username, client.user.avatarURL)

        return message.channel.send(help_embed)

    }

}

module.exports.help = {
    name: "help"
}





// ============== functions =>

//capitalize every case
function capitalize(str) {
    return str.replace(
        /\w\S*/g,
        function (txt) {
            if (txt.charAt(0) == "'") {
                return
            } else {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        }
    );
}