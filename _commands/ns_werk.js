//construct requirements
const botconfig = require("../_config/bot_config.json")
const embed = require("../_config/embed.json")
const functions = require('../_config/functions');
const Discord = require("discord.js");
const fetch = require("node-fetch");
const fs = require('fs');

//client requirements
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {

    //construct embedded message
    let ns_embed = new Discord.RichEmbed()
        .setTitle("NS Reisinformatie")
        .setDescription("Actuele [werkzaamheden](https://www.ns.nl/reisinformatie/actuele-situatie-op-het-spoor) aan het spoor \n" + embed.white_space)
        .setTimestamp()
        .setThumbnail(embed.avatar)
        .setColor(embed.color)
        .setFooter(client.user.username, embed.icon)

    //construct endpoint
    const endpoint = "https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/disruptions?type=werkzaamheid&actual=true&lang=en"

    //fetch endpoint with api-key Header
    fetch(endpoint, {
        headers: {
            'Ocp-Apim-Subscription-Key': process.env.NS_APIPORTAL_KEY
        }
    }).then(function (response) {
        return response.json();
    }).then(function (ns_werk_json) {

        //write fetched NS storing data to JSON
        let ns_werk_data = JSON.stringify(ns_werk_json);
        fs.writeFileSync('./_json/ns_werk_data.json', ns_werk_data);

        //fetch disruption payload
        let payloads = ns_werk_json.payload

        //if payload is empty, return message
        if (typeof payloads == 'undefined' || !payloads.length) return message.channel.send(">>> " + embed.sero_emote_white + " `Er zijn momenteel geen werkzaamheden!`")

        //loop through all payload
        for (i in payloads) {
            let payload = payloads[i]
            let type = payload.type

            //only grab the disruption type payload
            if (type == "werkzaamheid") {

                //get and construct all requirements for embed
                let title = payload.titel
                let gevolg = payload.verstoring.gevolg
                let periode = payload.verstoring.periode

                //add each disruption to embedded message
                ns_embed.addField("👷 Werkzaamheden traject " + title, gevolg + " " + "Werkzaamheden " + periode + "\n" + embed.white_space)

            } else {
                //get and construct remaining info
                let title_2 = payload.melding.titel
                let beschrijving = payload.melding.beschrijving

                //add each to embedded message
                ns_embed.addField("❗ " + title_2, beschrijving + "")
            }
        }

        //send embedded message to (target) channel
        return message.channel.send(ns_embed)

    }).catch(function (response) {
        console.error("Oops, something went wrong fetching >>> " + endpoint)
    })

}

module.exports.help = {
    name: "werk"
}