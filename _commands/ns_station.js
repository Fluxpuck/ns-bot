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

    //check if input is correct
    if (!args.length) return message.channel.send("❗ `Voer een station in, svp`").then(msg => { msg.delete(8000) })


    //// Message Handler => ////

    //string and capitalize input
    let messageArr = args.toString()
    let stationFrom = functions.capitalize(messageArr.replace(/[&\/\\#,+()$~%.":*?<>{}]/g, ' ').trim())

    //check for stations with -
    if (stationFrom.indexOf('-') > -1) {
        let fromArr = stationFrom.split("-")
        let tempFrom = functions.capitalize(fromArr[0]) + "-" + functions.capitalize(fromArr[1])
        stationFrom = tempFrom.replace(/[&\/\\#,+()$~%.":*?<>{}]/g, ' '.trim())
    }

    //check for exceptions
    function checkFromStation(station) { return station == stationFrom }

    //station exception handler
    let station_exc_json = JSON.parse(fs.readFileSync("./_config/station_exc.json", "utf8"))
    let exceptions = station_exc_json.exception

    //loop through all exceptions
    for (i in exceptions) {
        let exception = exceptions[i]
        let wrong = exception.false

        //if exception found, get correct station name
        if (wrong.some(checkFromStation) === true) {
            let good = exception.correct
            stationFrom = good
        }
    }

    //construct embedded message
    let ns_embed = new Discord.RichEmbed()
        .setTitle("NS Reisinformatie")
        .setDescription("Actuele vertrektijden van station " + stationFrom + " " + functions.time(new Date()) + "\n" + embed.white_space)
        .setTimestamp()
        .setThumbnail(embed.avatar)
        .setColor(embed.color)
        .setFooter(client.user.username, embed.icon)

    //quick fetching message for users
    message.channel.send(embed.sero_emote_white + " Ophalen vertrektijden station " + stationFrom + "...").then(msg => { msg.delete(2000) })


    //// API Handler => ////


    //construct endpoint
    const endpoint = "https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/stations"

    //fetch endpoint with api-key Header
    fetch(endpoint, {
        headers: {
            'Ocp-Apim-Subscription-Key': process.env.NS_APIPORTAL_KEY
        }
    }).then(function (response) {
        return response.json();
    }).then(function (ns_station_json) {

        //write fetched NS station data to JSON
        let ns_station_data = JSON.stringify(ns_station_json);
        fs.writeFileSync('./_json/ns_station_data.json', ns_station_data);

        //fetch station payload
        let payloads = ns_station_json.payload
        let stationcodeFrom

        //loop through all payload
        for (i in payloads) {
            let payload = payloads[i]
            let nameL = payload.namen.lang
            let nameM = payload.namen.middel
            let nameK = payload.namen.kort
            let synoniem = payload.synoniemen

            //check stationFrom in JSON, return stationcode
            if (nameL == stationFrom || nameM == stationFrom || nameK == stationFrom) {
                stationcodeFrom = payload.code
            } else if (synoniem[0] == stationFrom || synoniem[1] == stationFrom || synoniem[2] == stationFrom || synoniem[3] == stationFrom) {
                stationcodeFrom = payload.code
            }
        }

        // // stationcode debug =>
        // console.log("StationFrom: " + stationFrom)
        // console.log("StationcodeFrom: " + stationcodeFrom)

        //construct endpoint
        const endpoint = "https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/departures?maxJourneys=4&lang=nl&station=" + stationcodeFrom

        //fetch endpoint with api-key Header
        fetch(endpoint, {
            headers: {
                'Ocp-Apim-Subscription-Key': process.env.NS_APIPORTAL_KEY
            }
        }).then(function (response) {
            return response.json();
        }).then(function (ns_vertrek_json) {

            //write fetched NS vertrek data to JSON
            let ns_vertrek_data = JSON.stringify(ns_vertrek_json);
            fs.writeFileSync('./_json/ns_vertrek_data.json', ns_vertrek_data);

            //check for error messages
            if (ns_vertrek_json.message) return message.channel.send(">>> " + embed.sero_emote_white + " `" + ns_vertrek_json.errors[0].message + "`")

            //fetch vertrek payload
            let departures = ns_vertrek_json.payload.departures

            //loop through all departures, limited
            let departure_limit = 15
            for (let i = 0; i < departure_limit; i++) {
                let departure = departures[i]

                //depart information
                let train = departure.trainCategory
                let direction = departure.direction
                let plannedTrack = departure.plannedTrack
                let actualTrack = departure.actualTrack
                //depart Time
                let plannedTime = departure.plannedDateTime
                let actualTime = departure.actualDateTime
                let pTime = new Date(plannedTime)
                let aTime = new Date(actualTime)

                //check changes in departTime and departTrack
                let departTrack, departTime_diff
                if (aTime != pTime) departTime_diff = Math.floor((((aTime - pTime) % 86400000) % 3600000) / 60000) // minutes
                if (!actualTrack) { departTrack = plannedTrack }
                else { departTrack = actualTrack }

                //check if cancelled
                let cancelled = departure.cancelled
                if (cancelled === true) {
                    ns_embed.addField(train + " " + direction + " van " + functions.time(pTime), "🔴 Let op! Rijdt niet! \n" + embed.white_space)
                } else if (departTime_diff) {
                    ns_embed.addField(train + " " + direction, "🔸 Vertrekt om " + functions.time(pTime) + " +" + departTime_diff + " min vertraging van spoor " + departTrack + "\n" + embed.white_space, true)
                } else {
                    ns_embed.addField(train + " " + direction, "Vertrekt om " + functions.time(pTime) + " van spoor " + departTrack + "\n" + embed.white_space, true)
                }
            }

            //send embedded message to (target) channel
            return message.channel.send(ns_embed)

        }).catch(function (response) {
            console.error("Oops, something went wrong fetching >>> " + endpoint)
            // return message.channel.send("❗ `Fout met het ophalen van vertrektijden station " + stationFrom + "`").then(msg => { msg.delete(3000) })
        })
    }).catch(function (response) {
        console.error("Oops, something went wrong fetching >>> " + endpoint)
        // return message.channel.send("❗ `Fout met het ophalen van het station`").then(msg => { msg.delete(3000) })
    })

}

module.exports.help = {
    name: "station"
}