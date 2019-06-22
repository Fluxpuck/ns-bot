const botconfig = require("../botconfig.json")
const defaultconfig = require("../_server/default-config.json")
const fetch = require("node-fetch");
const fs = require('fs');
const Discord = require("discord.js")
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {

    const endpoint = 'https://ns-api.nl/reisinfo/api/v2/disruptions?type=storing&actual=true&lang=nl'

    fetch(endpoint, {
        headers: {
            'x-api-key': process.env.NS
        }
    }).then(function (response) {
        return response.json();
    }).then(function (nsjson) {

        // fetch results
        let data = JSON.stringify(nsjson);
        fs.writeFileSync('./json_export/ns_api_storing.json', data);

        let NS_storing_embed = new Discord.RichEmbed()
            .setTitle("NS Storingen")
            .setDescription("De actuele situatie op het spoor is als volgt. [NS Storingen](https://www.ns.nl/reisinformatie/actuele-situatie-op-het-spoor) \n_____")

        let payloads = nsjson.payload
        if (typeof payloads !== 'undefined' && payloads.length > 0) {
            // the array is defined and has at least one element

            for (i in payloads) {
                let payload = payloads[i]
                let type = payload.type

                if (type == "verstoring") {
                    let title = payload.titel
                    let oorzaak = payload.verstoring.oorzaak
                    let verwachting = payload.verstoring.verwachting
                    let alt_vervoer = payload.verstoring.alternatiefVervoer
                    let time = payload.verstoring.meldtijd

                    NS_storing_embed.addField("⚠ Storing traject " + title, oorzaak + " " + alt_vervoer + " " + verwachting + "\n_____")

                } else {
                    let title_2 = payload.melding.titel
                    let beschrijving = payload.melding.beschrijving

                    NS_storing_embed.addField("❗ " + title_2, beschrijving + "\n_____")
                }
            }

        } else {
            NS_storing_embed.addField("Gefeliciteerd 🎉", "Er zijn momenteel geen storingen")
        }

        NS_storing_embed.setTimestamp()
        NS_storing_embed.setThumbnail(defaultconfig.embed_avatar)
        NS_storing_embed.setColor(defaultconfig.embed_color);
        NS_storing_embed.setFooter(client.user.username, defaultconfig.embed_emblem);

        message.channel.send(NS_storing_embed)

    }).catch(function (response) {
        console.error("Er ging iets mis met het ophalen van de storingen")
    })

}

module.exports.help = {
    name: "storing"
}