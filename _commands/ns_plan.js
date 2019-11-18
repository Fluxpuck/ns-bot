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
    if (!args.length) return message.channel.send("❗ `Voer twee stations in, svp`").then(msg => { msg.delete(8000) })

    //message processor
    let messageArr = args.toString()
    let splitArr = messageArr.split(">")
    let stationFrom = functions.capitalize(splitArr[0].replace(/[&\/\\#,+()$~%.":*?<>{}]/g, ' ').trim())
    let stationTo = functions.capitalize(splitArr[1].replace(/[&\/\\#,+()$~%.":*?<>{}]/g, ' ').trim())

    //check for stations with -
    if (stationFrom.indexOf('-') > -1) {
        let fromArr = stationFrom.split("-")
        let tempFrom = functions.capitalize(fromArr[0]) + "-" + functions.capitalize(fromArr[1])
        stationFrom = tempFrom.replace(/[&\/\\#,+()$~%.":*?<>{}]/g, ' '.trim())
    }
    if (stationTo.indexOf('-') > -1) {
        let toArr = stationTo.split("-")
        let tempTo = functions.capitalize(toArr[0]) + "-" + functions.capitalize(toArr[1])
        stationTo = tempTo.replace(/[&\/\\#,+()$~%.":*?<>{}]/g, ' '.trim())
    }

    //check for exceptions
    function checkFromStation(station) { return station == stationFrom }
    function checkToStation(station) { return station == stationTo }

    //exception handler
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
        } else if (wrong.some(checkToStation) === true) {
            let good = exception.correct
            stationTo = good
        }
    }


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

        //fetch stationcode results
        let payloads = ns_station_json.payload
        let stationcodeFrom, stationcodeTo = null

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
            //check stationTo in JSON, return stationcode
            if (nameL == stationTo || nameM == stationTo || nameK == stationTo) {
                stationcodeTo = payload.code
            } else if (synoniem[0] == stationTo || synoniem[1] == stationTo || synoniem[2] == stationTo || synoniem[3] == stationTo) {
                stationcodeTo = payload.code
            }
        }

        //construct url to trip
        let tripURL = "https://www.ns.nl/reisplanner#/?vertrek=" + stationcodeFrom + "&vertrektype=treinstation&aankomst=" + stationcodeTo + "&aankomsttype=treinstation&type=vertrek"

        //construct embedded message
        let ns_embed = new Discord.RichEmbed()
            .setTitle("NS Reisplanner")
            .setDescription("[Reisadviezen](" + tripURL + ") van " + stationFrom + " naar " + stationTo)
            .setTimestamp()
            .setThumbnail(embed.avatar)
            .setColor(embed.color)
            .setFooter(client.user.username, embed.icon)


        //construct endpoint
        const endpoint = "https://gateway.apiportal.ns.nl/reisinformatie-api/api/v3/trips?previousAdvices=0&nextAdvices=5&travelClass=2&originTransit=false&excludeReservationRequired=true&originWalk=false&originBike=false&originCar=false&travelAssistanceTransferTime=0&searchForAccessibleTrip=false&destinationTransit=false&destinationWalk=false&destinationBike=false&destinationCar=false&excludeHighSpeedTrains=false&excludeReservationRequired=false&passing=false&fromStation=" + stationcodeFrom + "&toStation=" + stationcodeTo

        //fetch endpoint with api-key Header
        fetch(endpoint, {
            headers: {
                'Ocp-Apim-Subscription-Key': process.env.NS_APIPORTAL_KEY
            }
        }).then(function (response) {
            return response.json();
        }).then(function (ns_trip_json) {

            //write fetched NS trip data to JSON
            let ns_trip_data = JSON.stringify(ns_trip_json);
            fs.writeFileSync('./_json/ns_trip_data.json', ns_trip_data);

            //check for error messages
            if (!stationcodeFrom && !stationcodeTo) return message.channel.send(">>> " + embed.sero_emote_white + " `Vertrek- en aankomstpunt zijn verkeerd ingevuld 🙁`")
            if (!stationcodeFrom) return message.channel.send(">>> " + embed.sero_emote_white + " `Vertrekpunt is verkeerd ingevuld 🙁`")
            if (!stationcodeTo) return message.channel.send(">>> " + embed.sero_emote_white + " `Aankomstpunt is verkeerd ingevuld 🙁`")
            if (ns_trip_json.message) { return message.channel.send(">>> " + embed.sero_emote_white + " `" + ns_trip_json.errors[0].message + "`") }

            //quick fetching message for users
            message.channel.send(embed.sero_emote_white + " Ophalen reizen van station " + stationFrom + " naar station " + stationTo + "...").then(msg => { msg.delete(2000) })

            //fetch all trips
            let trips = ns_trip_json.trips


            //loop through trips, limited
            let trip_limit = 3
            for (i = 0; i < trip_limit; i++) {
                let trip = trips[i]

                //define trip length and count transfers    
                let duration = trip.plannedDurationInMinutes
                let transfers = trip.transfers
                let tripTime = functions.time(new Date(trip.legs[0].origin.plannedDateTime))

                // => trip header with duration and transfers
                ns_embed.addField(embed.white_space + "\n" + embed.white_space, stationFrom + " - " + stationTo + " om **" + tripTime + "**\n" + embed.sero_emote_train + " _" + duration + " minuten_ " + embed.sero_emote_white + " _" + transfers + " x overstappen_")

                //fetch all legs of the trip
                let legs = trip.legs

                //loop through all legs
                for (ii in legs) {
                    let leg = legs[ii]

                    //define leg departments
                    let trainDirection = leg.direction
                    let trainType = (leg.name).replace(/[0-9]/g, '');
                    let dTime = new Date(leg.origin.plannedDateTime)
                    let departTime = functions.time(dTime)
                    let daTime = new Date(leg.origin.actualDateTime)
                    let actualTime = functions.time(daTime)
                    let departStation = leg.origin.name
                    let departTrack = leg.origin.plannedTrack
                    let actualTrack = leg.origin.actualTrack

                    //define leg arrivals
                    let aTime = new Date(leg.destination.plannedDateTime)
                    let arriveTime = functions.time(aTime)
                    let arriveStation = leg.destination.name
                    let arriveTrack = leg.destination.plannedTrack

                    //define extra information
                    let delay = Math.floor((((daTime - dTime) % 86400000) % 3600000) / 60000)
                    let trainstops = leg.stops.length
                    let crowdForecast = leg.crowdForecast

                    //check if trainDirection is defined
                    if (typeof trainDirection == 'undefined' || !trainDirection.length) { trainDirection = "onbekend" }

                    //check if crowdforcast is defined and translate
                    if (typeof crowdForecast == 'undefined' || !crowdForecast.length) { crowdForecast = "onbekend" }
                    if (crowdForecast === "LOW") crowdForecast = "rustig"
                    if (crowdForecast === "MEDIUM") crowdForecast = "normaal"
                    if (crowdForecast === "HIGH") crowdForecast = "druk"

                    //check for any disruptions
                    if (typeof departTrack == 'undefined' || !departTrack.length) {
                        ns_embed.addField(embed.white_space, "🔴 Let op! Deze reis is niet mogelijk \n`Bekijk de storingen voor meer informatie`")
                    } else if (delay != "Nan" && delay > 0) {
                        ns_embed.addField("🔸 Let op! +" + delay + " min vertraging", " **" + departTime + "** - " + departStation + " spoor " + departTrack + "\n_" + trainType + " " + trainDirection + "_\n|\n **" + arriveTime + "** - " + arriveStation)
                        // ns_embed.addField("drukte: " + crowdForecast.toLowerCase() + " - tussenstops: " + trainstops + "\n" + "🔸 Let op! +" + delay + " min vertraging", " **" + departTime + "** - " + departStation + " spoor " + departTrack + "\n_" + trainType + " " + trainDirection + "_\n|\n **" + arriveTime + "** - " + arriveStation)
                    } else {
                        ns_embed.addField("drukte: " + crowdForecast.toLowerCase() + " - tussen stations: " + trainstops + "", " **" + departTime + "** - " + departStation + " spoor " + departTrack + "\n_" + trainType + " " + trainDirection + "_\n|\n **" + arriveTime + "** - " + arriveStation)
                    }
                }
            }

            //send embedded message to (target) channel
            return message.channel.send(ns_embed)

        }).catch(function (response) {
            console.error("Oops, something went wrong fetching >>> " + endpoint)
            // return message.channel.send("❗ `Fout met het ophalen van treinreis van station " + stationFrom + " naar station " + stationTo + "`").then(msg => { msg.delete(3000) })
        })

    }).catch(function (response) {
        console.error("Oops, something went wrong fetching >>> " + endpoint)
        // return message.channel.send("❗ `Fout met het ophalen van het station`").then(msg => { msg.delete(3000) })
    })

}

module.exports.help = {
    name: "plan"
}