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

    //quick fetching message for users
    message.channel.send(embed.sero_emote_white + " Ophalen geplande werkzaamheden...").then(msg => { msg.delete(2000) })

    //construct embedded message
    let ns_embed = new Discord.RichEmbed()
        .setTitle("NS Reisinformatie")
        .setTimestamp()
        .setThumbnail(embed.avatar)
        .setColor(embed.color)

    //construct Arrays
    var tempArray = [];
    var chunkArray = [];

    //construct endpoint
    const endpoint = "https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/disruptions?type=werkzaamheid&actual=false&lang=en"

    //fetch endpoint with api-key Header
    fetch(endpoint, {
        headers: {
            'Ocp-Apim-Subscription-Key': process.env.NS_APIPORTAL_KEY
        }
    }).then(function (response) {
        return response.json();
    }).then(function (ns_gepland_json) {

        //write fetched NS storing data to JSON
        let ns_gepland_data = JSON.stringify(ns_gepland_json);
        fs.writeFileSync('./_json/ns_gepland_data.json', ns_gepland_data);

        //fetch disruption payload
        let payloads = ns_gepland_json.payload

        //if payload is empty, return message else send fetching message
        if (typeof payloads == 'undefined' || !payloads.length) return message.channel.send(">>> " + embed.sero_emote_white + " `Er zijn geen geplande werkzaamheden!`")

        //loop through all payload
        for (i in payloads) {
            let payload = payloads[i]
            let type = payload.type

            if (type == "werkzaamheid") {
                let title = payload.titel
                let gevolg = payload.verstoring.gevolg
                let periode = payload.verstoring.periode

                tempArray.push("👷 Werkzaamheden traject " + title + ":\n" + gevolg + " Werkzaamheden " + periode + "\n " + embed.white_space)
            }
        }

        //slice array in chunks of 5
        var i, j, temparray, chunk = 5;
        for (i = 0, j = tempArray.length; i < j; i += chunk) {
            chunkArray.push(temparray = tempArray.slice(i, i + chunk));
        }

        //for each array, add the description
        chunkArray.forEach(arr => {
            arr.unshift("Geplande [werkzaamheden](https://www.ns.nl/reisinformatie/werk-aan-het-spoor) aan het spoor\n" + embed.white_space)
        });


        //// Paginator construction => ////

        //default (start)page
        let pages = chunkArray
        let page = 1

        //add variables to embed message
        ns_embed.setDescription(pages[page - 1])
        ns_embed.setFooter(`Pagina ${page} van ${pages.length}`)

        message.channel.send(ns_embed).then(msg => {

            //add reactions to message
            msg.react('◀').then(r => {
                msg.react('▶')
            })

            //filter reactions
            const filter = (reaction, user) => {
                return ['◀', '▶'].includes(reaction.emoji.name) && user.id === message.author.id;
            };

            //collect all reactions & edit embed
            msg.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
                .then(collected => {

                    //handles first collected reaction
                    const reaction = collected.first();
                    if (reaction.emoji.name === '◀') {
                        if (page === 1) return
                        page--
                        ns_embed.setDescription(pages[page - 1])
                        ns_embed.setFooter(`Pagina ${page} van ${pages.length}`)
                        msg.edit(ns_embed)
                    } else if (reaction.emoji.name === '▶') {
                        if (page === pages.length) return
                        page++
                        ns_embed.setDescription(pages[page - 1])
                        ns_embed.setFooter(`Pagina ${page} van ${pages.length}`)
                        msg.edit(ns_embed)
                    }

                    //handles collection reactions on add event
                    client.on('messageReactionAdd', (reaction, user) => {
                        // console.log(`${user.username} reacted with "${reaction.emoji.name}".`);
                        if (reaction.emoji.name === '◀' && user.id === message.author.id) {
                            if (page === 1) return
                            page--
                            ns_embed.setDescription(pages[page - 1])
                            ns_embed.setFooter(`Pagina ${page} van ${pages.length}`)
                            msg.edit(ns_embed)
                        } else if (reaction.emoji.name === '▶' && user.id == message.author.id) {
                            if (page === pages.length) return
                            page++
                            ns_embed.setDescription(pages[page - 1])
                            ns_embed.setFooter(`Pagina ${page} van ${pages.length}`)
                            msg.edit(ns_embed)
                        }
                    });

                    //handles collection reaction on remove event
                    client.on('messageReactionRemove', (reaction, user) => {
                        // console.log(`${user.username} removed reaction with "${reaction.emoji.name}".`);
                        if (reaction.emoji.name === '◀' && user.id === message.author.id) {
                            if (page === 1) return
                            page--
                            ns_embed.setDescription(pages[page - 1])
                            ns_embed.setFooter(`Pagina ${page} van ${pages.length}`)
                            msg.edit(ns_embed)
                        } else if (reaction.emoji.name === '▶' && user.id == message.author.id) {
                            if (page === pages.length) return
                            page++
                            ns_embed.setDescription(pages[page - 1])
                            ns_embed.setFooter(`Pagina ${page} van ${pages.length}`)
                            msg.edit(ns_embed)
                        }
                    });
                })
                .catch(collected => {
                    message.reply("je hebt geen gebruik gemaakt van de pagina's.\nDruk volgende keer op de \◀  of  \▶ emojies onder het bericht.")
                });

        })

    }).catch(function (response) {
        console.error("Oops, something went wrong fetching >>> " + endpoint)
    })

}

module.exports.help = {
    name: "gepland"
}