const botconfig = require("../botconfig.json")
const defaultconfig = require("../_server/default-config.json")
const fetch = require("node-fetch");
const fs = require('fs');
const Discord = require("discord.js")
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {

    //construct Arrays
    let tempArray = []
    let tArray = []

    //Fetch all planned work-activities
    const endpoint = 'https://ns-api.nl/reisinfo/api/v2/disruptions?type=werkzaamheid&actual=false&lang=nl'
    fetch(endpoint, {
        headers: {
            'x-api-key': process.env.NS
        }
    }).then(function (response) {
        return response.json();
    }).then(function (nsjson) {

        //write results
        let data = JSON.stringify(nsjson);
        fs.writeFileSync('./json_export/ns_api_gwerk.json', data);

        let payloads = nsjson.payload
        for (i in payloads) {
            let payload = payloads[i]
            let type = payload.type

            if (type == "werkzaamheid") {
                let title = payload.titel
                let gevolg = payload.verstoring.gevolg
                let periode = payload.verstoring.periode

                tempArray.push("👷 Werkzaamheden traject " + title + ":\n" + gevolg + " Werkzaamheden " + periode + "\n–")

                //write results
                let tArr = JSON.stringify(tempArray);
                fs.writeFileSync('./json_export/ns_api_gwerk_tempArray.json', tArr);
            }
        }

    }).catch(function (response) {
        console.error("Er ging iets mis met het ophalen van de geplande werkzaamheden")
    })

    //slice tempArray in chunks of 5
    let tArr = JSON.parse(fs.readFileSync("./json_export/ns_api_gwerk_tempArray.json", "utf8"))
    var i, j, temparray, chunk = 5;
    for (i = 0, j = tArr.length; i < j; i += chunk) {
        tArray.push(temparray = tArr.slice(i, i + chunk));

        //write results
        let t = JSON.stringify(tArray);
        fs.writeFileSync('./json_export/ns_api_gwerk.json', t);
    }

    let pages = JSON.parse(fs.readFileSync("./json_export/ns_api_gwerk.json", "utf8"))
    if (typeof pages == 'undefined' && pages.length <= 0) {
        pages = ['"WOW 🎈", "Er zijn momenteel geen geplande werkzaamheden!"']
    }

    //default (start)page
    let page = 1

    //setup embed message
    let embed = new Discord.RichEmbed()
        .setFooter(`Pagina ${page} van ${pages.length}`, defaultconfig.embed_emblem)
        .setTitle("NS Geplande Werkzaamheden")
        .setDescription(pages[page - 1])
        .setColor(defaultconfig.embed_color)
        .setThumbnail(defaultconfig.embed_avatar)
        .setTimestamp()

    message.channel.send(embed).then(msg => {

        //add reactions to message
        msg.react('◀').then(r => {
            msg.react('▶')
        })

        //filter reactions
        const filter = (reaction, user) => {
            return ['◀', '▶'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        //collect all reactions & edit embed
        msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
            .then(collected => {

                //handles first collected reaction
                const reaction = collected.first();
                if (reaction.emoji.name === '◀') {
                    if (page === 1) return
                    page--
                    embed.setDescription(pages[page - 1])
                    embed.setFooter(`Pagina ${page} van ${pages.length}`, defaultconfig.embed_emblem)
                    msg.edit(embed)
                } else if (reaction.emoji.name === '▶') {
                    if (page === pages.length) return
                    page++
                    embed.setDescription(pages[page - 1])
                    embed.setFooter(`Pagina ${page} van ${pages.length}`, defaultconfig.embed_emblem)
                    msg.edit(embed)
                }

                //handles collection reactions on add event
                client.on('messageReactionAdd', (reaction, user) => {
                    // console.log(`${user.username} reacted with "${reaction.emoji.name}".`);
                    if (reaction.emoji.name === '◀' && user.id === message.author.id) {
                        if (page === 1) return
                        page--
                        embed.setDescription(pages[page - 1])
                        embed.setFooter(`Pagina ${page} van ${pages.length}`, defaultconfig.embed_emblem)
                        msg.edit(embed)
                    } else if (reaction.emoji.name === '▶' && user.id == message.author.id) {
                        if (page === pages.length) return
                        page++
                        embed.setDescription(pages[page - 1])
                        embed.setFooter(`Pagina ${page} van ${pages.length}`, defaultconfig.embed_emblem)
                        msg.edit(embed)
                    }
                });

                //handles collection reaction on remove event
                client.on('messageReactionRemove', (reaction, user) => {
                    // console.log(`${user.username} removed reaction with "${reaction.emoji.name}".`);
                    if (reaction.emoji.name === '◀' && user.id === message.author.id) {
                        if (page === 1) return
                        page--
                        embed.setDescription(pages[page - 1])
                        embed.setFooter(`Pagina ${page} van ${pages.length}`, defaultconfig.embed_emblem)
                        msg.edit(embed)
                    } else if (reaction.emoji.name === '▶' && user.id == message.author.id) {
                        if (page === pages.length) return
                        page++
                        embed.setDescription(pages[page - 1])
                        embed.setFooter(`Pagina ${page} van ${pages.length}`, defaultconfig.embed_emblem)
                        msg.edit(embed)
                    }
                });
            })
            .catch(collected => {
                message.reply("Je hebt geen gebruik gemaakt van de pagina's onder de Geplande Werkzaamheden. Druk de volgende keer op  ◀  of  ▶  om naar de vorige en volgende pagina te gaan.");
            });
    })
}

module.exports.help = {
    name: "gepland"
}