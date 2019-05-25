const botconfig = require("../botconfig.json")
const defaultconfig = require("../_server/default-config.json")
const fetch = require("node-fetch");
const fs = require('fs');
const Discord = require("discord.js")
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {

    //message processor
    let messageArr = args.toString()
    let splitArr = messageArr.split(">")
    let stationFrom = capitalize(splitArr[0].replace(/[&\/\\#,+()$~%.":*?<>{}]/g, ' ').trim())
    let stationTo = capitalize(splitArr[1].replace(/[&\/\\#,+()$~%.":*?<>{}]/g, ' ').trim())

    //check for exceptions
    function checkFromStation(station) {
        return station == stationFrom
    }
    function checkToStation(station) {
        return station == stationTo
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
        } else if (wrong.some(checkToStation) === true) {
            let good = exception.correct
            stationTo = good
        }
    }

    // console.log(stationFrom)
    // console.log(stationTo)

    //fetching-message
    message.channel.send("Ophalen reizen van station " + stationFrom + " naar station " + stationTo + "...")
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
        // let data = JSON.stringify(nsjson);
        // fs.writeFileSync('./json_export/ns_api_station.json', data);

        //fetch stationcode results
        let payloads = nsjson.payload
        let stationcodeFrom = null
        let stationcodeTo = null
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
            //check stationTo in JSON, return stationcode
            if (nameL == stationTo || nameM == stationTo || nameK == stationTo) {
                stationcodeTo = payload.code
            } else if (synoniem[0] == stationTo || synoniem[1] == stationTo || synoniem[2] == stationTo || synoniem[3] == stationTo) {
                stationcodeTo = payload.code
            }
        }

        // console.log(stationcodeFrom)
        // console.log(stationcodeTo)

        //fetching stationcode > fetching trip
        const endpoint = 'https://ns-api.nl/reisinfo/api/v3/trips?previousAdvices=0&nextAdvices=3&travelClass=2&originTransit=false&originWalk=false&originBike=false&originCar=false&travelAssistanceTransferTime=0&searchForAccessibleTrip=false&destinationTransit=false&destinationWalk=false&destinationBike=false&destinationCar=false&excludeHighSpeedTrains=false&excludeReservationRequired=false&passing=false&fromStation=' + stationcodeFrom + '&toStation=' + stationcodeTo

        fetch(endpoint, {
            headers: { 'x-api-key': process.env.NS }
        }).then(function (response) {
            return response.json();
        }).then(function (nstjson) {

            //fetch results
            // let data = JSON.stringify(nstjson);
            // fs.writeFileSync('./json_export/ns_api_trip.json', data);

             //correct timestamp for NS-reisplanner URL
            var t = new Date();
            let lTime = t.toString()
            let linkTime = lTime.split(' ').join('').replace('(CEST)', '')

            //create NS-reisplanner URL
            let tripLink = "https://www.ns.nl/reisplanner#/?vertrek=" + stationcodeFrom + "&vertrektype=treinstation&aankomst=" + stationcodeTo + "&aankomsttype=treinstation&type=vertrek"

            let NS_trip_embed = new Discord.RichEmbed()
                .setTitle("NS Reisplanner")

            if (nstjson.message) {
                let badtrip = nstjson.errors[0].message

                NS_trip_embed.addField("⚠ Melding", badtrip + "\n of het is verkeerd geschreven.")

                NS_trip_embed.setTimestamp()
                NS_trip_embed.setColor(defaultconfig.embed_color);
                NS_trip_embed.setFooter(client.user.username, client.user.avatarURL);

            } else {

                NS_trip_embed.setDescription(stationFrom + " - " + stationTo + " om " + time(t) + " \nLink naar je geplande reis: [NS Reisplanner](" + tripLink + ")")
                NS_trip_embed.addBlankField(true);

                let trips = nstjson.trips
                for (i in trips) {
                    let trip = trips[i]

                    if (!trip) {
                        NS_trip_embed.addField("Melding", "Er zijn momenteel geen treinreizen in de planner")
                    } else {
                        let duration = trip.plannedDurationInMinutes
                        let transfers = trip.transfers

                        NS_trip_embed.addField(stationFrom + " - " + stationTo, "🕙  " + duration + " minuten - 🚶 " + transfers + " x overstappen" + "\n _______________________________")

                        let legs = trip.legs
                        for (i in legs) {
                            let leg = legs[i]

                            let departTime = leg.origin.plannedDateTime
                            let d = new Date(departTime)
                            let dTime = time(d)
                            let departStation = leg.origin.name
                            let departTrack = leg.origin.plannedTrack
                            let arriveTime = leg.destination.plannedDateTime
                            let a = new Date(arriveTime)
                            let aTime = time(a)
                            let arriveStation = leg.destination.name
                            let arriveTrack = leg.destination.plannedTrack
                            let traintype = leg.name
                            let trainDirection = leg.direction


                            NS_trip_embed.addField("Vertrek " + dTime + " - " + departStation + " spoor " + departTrack, traintype + " richting " + trainDirection + " \n | \n" + "Aankomst " + aTime + " - " + arriveStation + " spoor " + arriveTrack)
                        }
                        NS_trip_embed.addBlankField(true)
                    }

                    NS_trip_embed.setTimestamp()
                    NS_trip_embed.setThumbnail("http://customizedwear.nl/wp-content/uploads/2017/12/nederlandse-spoorwegen-ns-logo.png")
                    NS_trip_embed.setColor(defaultconfig.embed_color);
                    NS_trip_embed.setFooter(client.user.username, client.user.avatarURL);

                }

            }

            message.channel.send(NS_trip_embed)

        }).catch(function (response) {
            console.error("Er ging iets mis met het ophalen van de treinreis")
        })



    }).catch(function (response) {
        console.error("Er ging iets mis met het ophalen van de treincode")
    })

}

module.exports.help = {
    name: "plan"
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