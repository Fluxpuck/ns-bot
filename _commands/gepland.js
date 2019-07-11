const botconfig = require("../botconfig.json")
const defaultconfig = require("../_server/default-config.json")
const fetch = require("node-fetch");
const fs = require('fs');
const Discord = require("discord.js")
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {

  //fetch disruptions
    function disruptions() {

        //construct Arrays
        var tempArray = [];
        var chunkArray = [];

        var endpoint = 'https://ns-api.nl/reisinfo/api/v2/disruptions?type=werkzaamheid&actual=false&lang=nl'
        fetch(endpoint, {
            headers: { 'x-api-key': process.env.NS }
        })
            .then(res => res.json())
            .then(function (res) {
          
                //write results
                let data = JSON.stringify(res);
                fs.writeFileSync('./json_export/ns_api_gwerk.json', data);

                let payloads = res.payload
                for (i in payloads) {
                    let payload = payloads[i]
                    let type = payload.type

                    if (type == "werkzaamheid") {
                        let title = payload.titel
                        let gevolg = payload.verstoring.gevolg
                        let periode = payload.verstoring.periode

                        tempArray.push("👷 Werkzaamheden traject " + title + ":\n" + gevolg + " Werkzaamheden " + periode + "\n–")
                    }
                }

                //slice array in chunks of 5
                var i, j, temparray, chunk = 5;
                for (i = 0, j = tempArray.length; i < j; i += chunk) {
                    chunkArray.push(temparray = tempArray.slice(i, i + chunk));
                }

                //check if array is empty
                let pages = chunkArray
                if (typeof pages == 'undefined' && pages.length <= 0) {
                    pages = ['"WOW 🎈", "Er zijn momenteel geen geplande werkzaamheden!"']
                }

                //default (start)page
                let page = 1

                //setup embed message
                let embed = new Discord.RichEmbed()
                    .setFooter(`Pagina ${page} van ${pages.length}`)
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
                                embed.setFooter(`Pagina ${page} van ${pages.length}`)
                                msg.edit(embed)
                            } else if (reaction.emoji.name === '▶') {
                                if (page === pages.length) return
                                page++
                                embed.setDescription(pages[page - 1])
                                embed.setFooter(`Pagina ${page} van ${pages.length}`)
                                msg.edit(embed)
                            }

                            //handles collection reactions on add event
                            client.on('messageReactionAdd', (reaction, user) => {
                                // console.log(`${user.username} reacted with "${reaction.emoji.name}".`);
                                if (reaction.emoji.name === '◀' && user.id === message.author.id) {
                                    if (page === 1) return
                                    page--
                                    embed.setDescription(pages[page - 1])
                                    embed.setFooter(`Pagina ${page} van ${pages.length}`)
                                    msg.edit(embed)
                                } else if (reaction.emoji.name === '▶' && user.id == message.author.id) {
                                    if (page === pages.length) return
                                    page++
                                    embed.setDescription(pages[page - 1])
                                    embed.setFooter(`Pagina ${page} van ${pages.length}`)
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
                                    embed.setFooter(`Pagina ${page} van ${pages.length}`)
                                    msg.edit(embed)
                                } else if (reaction.emoji.name === '▶' && user.id == message.author.id) {
                                    if (page === pages.length) return
                                    page++
                                    embed.setDescription(pages[page - 1])
                                    embed.setFooter(`Pagina ${page} van ${pages.length}`)
                                    msg.edit(embed)
                                }
                            });
                        })
                        .catch(collected => {
                            message.reply("Je hebt geen gebruik gemaakt van de pagina's onder de Geplande Werkzaamheden. Druk de volgende keer op  ◀  of  ▶  om naar de vorige en volgende pagina te gaan.");
                        });
                })

            })
            // .then(() => console.log(tempArray))
            // .then(() => console.log(chunkArray))
            .catch(err => console.log(err));

    }

    disruptions();  
  
}

module.exports.help = {
    name: "gepland"
}