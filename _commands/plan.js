const botconfig = require("../botconfig.json")
const defaultconfig = require("../_server/default-config.json")
var mysql = require('mysql');
const fetch = require("node-fetch");
const fs = require('fs');
const Discord = require("discord.js")
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {
  
    //database connection
    var conn = mysql.createConnection({
        host: process.env.HOSTIP,
        user: process.env.DBLOGIN,
        password: process.env.DBPASSWORD,
        database: botconfig.db_select,
        port: botconfig.port
    });

    //message processor
    let messageArr = args.toString()
    let splitArr = messageArr.split(">")
    let stationFrom
    let stationTo
    //prevents console errors if split type is wrong
    if (splitArr.length >= 2){
        stationFrom = capitalize(splitArr[0].replace(/[&\/\\#,+()$~%.":*?<>{}]/g, ' ').trim())
        stationTo = capitalize(splitArr[1].replace(/[&\/\\#,+()$~%.":*?<>{}]/g, ' ').trim())
    } else { return }
     
    //check for stations with -
    if (stationFrom.indexOf('-') > -1) {
        let fromArr = stationFrom.split("-")
        let tempFrom = capitalize(fromArr[0]) + "-" + capitalize(fromArr[1])
        stationFrom = tempFrom.replace(/[&\/\\#,+()$~%.":*?<>{}]/g, ' '.trim())
    }
    if (stationTo.indexOf('-') > -1) {
        let toArr = stationTo.split("-")
        let tempTo = capitalize(toArr[0]) + "-" + capitalize(toArr[1])
        stationTo = tempTo.replace(/[&\/\\#,+()$~%.":*?<>{}]/g, ' '.trim())
    }
  
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
        let data = JSON.stringify(nsjson);
        fs.writeFileSync('./json_export/ns_api_station.json', data);

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
            let data = JSON.stringify(nstjson);
            fs.writeFileSync('./json_export/ns_api_trip.json', data);

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
  
    conn.connect(function (err) {
        if (err) throw err;

        conn.query("SELECT * FROM train_history WHERE user = " + message.author.id + " ORDER BY ID DESC", function (err, result, fields) {
            if (err) throw err;

            let db_trip = stationFrom + " > " + stationTo

            //grab trip ID & count from database
            let id
            let count
            for (let i = 0; i < result.length; i++) {
                let results = result[i]
                if (results.trip == db_trip) {
                    id = results.ID
                    count = results.update_count
                }
            }

            //if values ID & count are set
            if (id && count) {
                //UPDATE timestamp if trip is already in DB
                console.log("----->");
                var sql = "UPDATE train_history SET update_count = " + (count + 1) + " WHERE ID = " + id + "";
                conn.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("Updated database row with ID: " + id + ",\nUpdate count is now " + (count + 1));
                });
            } else if (result.length < 5) {
                //insert in database if there is less then 5
                console.log("----->");
                var sql = "INSERT INTO train_history (user, trip) VALUES ('" + message.author.id + "' , '" + stationFrom + " > " + stationTo + "')";
                conn.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("Writen in database with ID: " + result.insertId);
                });
            } else if (result.length >= 5) {
                //if there are equal or more than 5 results, remove the last one and insert new one
                console.log("----->");
                let firstID = result[0].ID
                var sql = "DELETE FROM train_history WHERE ID = " + firstID + " ORDER BY ID DESC";
                conn.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("Removed " + result.affectedRows + " trip history");
                });

                var sql = "INSERT INTO train_history (user, trip) VALUES ('" + message.author.id + "' , '" + stationFrom + " > " + stationTo + "')";
                conn.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("Writen in database with ID: " + result.insertId);
                });
            }

        });

    });

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