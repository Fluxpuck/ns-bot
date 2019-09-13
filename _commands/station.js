const botconfig = require("../botconfig.json")
const defaultconfig = require("../_server/default-config.json")
const fetch = require("node-fetch");
const fs = require('fs');
const Discord = require("discord.js")
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {

    //message processor
    let stationFrom = capitalize(args[0].replace(/[&\/\\#,+()$~%.":*?<>{}]/g, ' ').trim())

    //check for stations with -
    if (stationFrom.indexOf('-') > -1) {
        let fromArr = stationFrom.split("-")
        let tempFrom = capitalize(fromArr[0]) + "-" + capitalize(fromArr[1])
        stationFrom = tempFrom.replace(/[&\/\\#,+()$~%.":*?<>{}]/g, ' '.trim())
    }

    //check for exceptions
    function checkFromStation(station) {
        return station == stationFrom
    }

    //exception handler
    let Ejson = JSON.parse(fs.readFileSync("./_server/station-exceptions.json", "utf8"))
    let exceptions = Ejson.exception
    for (i in exceptions) {
        let exception = exceptions[i]
        let wrong = exception.false

        if (wrong.some(checkFromStation) === true) {
            let good = exception.correct
            stationFrom = good
        }
    }

    //fetching-message
    message.channel.send("Ophalen vertrektijden station " + stationFrom + "...")
        .then(msg => {
            msg.delete(4000)
        })

    //fetching stationcode > fetching trip
    const endpoint = 'https://ns-api.nl/reisinfo/api/v2/stations'

    fetch(endpoint, {
        headers: { 'x-api-key': process.env.NS }
    }).then(function (response) {
        return response.json();
    }).then(function (nsjson) {

        //fetch results
        let data = JSON.stringify(nsjson);
        fs.writeFileSync('./json_export/ns_api_station.json', data);

        //fetch stationcode results
        let payloads = nsjson.payload
        let stationcodeFrom = null
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

        // //Trainstation DEBUG =>
        // console.log("StationFrom: " + stationFrom)
        // console.log("StationcodeFrom: " + stationcodeFrom)

        //fetching stationcode > fetching departure times stationFrom
        const endpoint = 'https://ns-api.nl/reisinfo/api/v2/departures?maxJourneys=4&lang=nl&station=' + stationcodeFrom

        fetch(endpoint, {
            headers: { 'x-api-key': process.env.NS }
        }).then(function (response) {
            return response.json();
        }).then(function (nstjson) {

            // //fetch results
            let data = JSON.stringify(nstjson);
            fs.writeFileSync('./json_export/ns_api_vertrekt.json', data);

            let currentTime = new Date()
            let cTime = time(currentTime)

            let NS_trip_embed = new Discord.RichEmbed()
                .setTitle("NS Vertrektijden - Station " + stationFrom + " " + cTime)
                .setDescription("De actuele vertrektijden vanaf station " + stationFrom + "\n➖")

            if (nstjson.message) {
                let badtrip = nstjson.errors[0].message

                NS_trip_embed.addField("⚠ Melding", badtrip)

                NS_trip_embed.setTimestamp()
                NS_trip_embed.setColor(defaultconfig.embed_color);
                NS_trip_embed.setFooter(client.user.username, client.user.avatarURL);

            } else {

                try {

                    let departures = nstjson.payload.departures
                    // for (i in departures) {
                    let i
                    let departure_limit = 16
                    for (i = 0; i < departure_limit; i++) {
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

                        //check if departure time is changed
                        let departTime, departTime_diff
                        if (aTime === pTime) {
                            departTime = time(aTime)
                        } else {
                            //calculate difference
                            diff = (aTime - pTime)
                            departTime_diff = Math.floor(((diff % 86400000) % 3600000) / 60000) // minutes
                        }

                        //check is track is changed
                        let departTrack
                        if (!actualTrack) {
                            departTrack = plannedTrack
                        } else {
                            departTrack = actualTrack
                        }

                        //check if cancelled
                        let cancelled = departure.cancelled
                        if (cancelled === true) {
                            NS_trip_embed.addField(train + " " + direction + " van " + time(pTime), "🔴 Let op! Rijdt niet! \n–")
                        } else if (departTime_diff) {
                            NS_trip_embed.addField(train + " " + direction, "🔸 Vertrekt om " + time(pTime) + " +" + departTime_diff + " min \nvertraging van spoor " + departTrack + "\n–", true)
                        } else {
                            NS_trip_embed.addField(train + " " + direction, "Vertrekt om " + time(pTime) + " van spoor " + departTrack + "\n–", true)
                        }

                        NS_trip_embed.setTimestamp()
                        NS_trip_embed.setThumbnail(defaultconfig.embed_avatar)
                        NS_trip_embed.setColor(defaultconfig.embed_color);
                        NS_trip_embed.setFooter(client.user.username, defaultconfig.embed_emblem);

                    }
                } catch (error) {
                    // console.log("ERROR " + error)
                }

            }

            return message.channel.send(NS_trip_embed)

        }).catch(function (response) {
            console.error("Er ging iets mis met het ophalen van de vertrektijden")
        })

    }).catch(function (response) {
        console.error("Er ging iets mis met het ophalen van de treincode")
    })

}

module.exports.help = {
    name: "station"
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

//convert time to hours & minutes only
function time(t) {
    var time =
        ("0" + t.getHours()).slice(-2) + ":" +
        ("0" + t.getMinutes()).slice(-2);
    return time
}