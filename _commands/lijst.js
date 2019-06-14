const botconfig = require("../botconfig.json")
const defaultconfig = require("../_server/default-config.json")
var mysql = require('mysql');
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

    conn.connect(function (err) {
        if (err) throw err;

        var NS_history_embed = new Discord.RichEmbed()
            .setTitle("Geschiedenis van " + message.member.user.tag)
            .setDescription("Hier volgen jouw 5 laatste reisplanningen: \n___")

        conn.query("SELECT * FROM train_history WHERE user = " + message.author.id + " ORDER BY id DESC", function (err, result, fields) {
            if (err) throw err;

            for (let i = 0; i < result.length; i++) {
                let results = result[i]
                let db_trip = results.trip
                let db_time = results.timestamp

                if (result.lenght < 0) {
                    NS_history_embed.addField("Hallo!", "Je hebt nog geen reizen gepland. \nGebruik `!plan [station] > [station]` om een reis te plannen.")
                } else {
                    NS_history_embed.addField("[" + (i + 1) + "] " + db_trip, "Datum: " + date(db_time) + "\n__")
                }
            }

            NS_history_embed.setTimestamp()
            NS_history_embed.setThumbnail("http://customizedwear.nl/wp-content/uploads/2017/12/nederlandse-spoorwegen-ns-logo.png")
            NS_history_embed.setColor(defaultconfig.embed_color);
            NS_history_embed.setFooter(client.user.username, client.user.avatarURL);

            message.channel.send(NS_history_embed)

        });
    });
}

module.exports.help = {
    name: "lijst"
}




// ============== functions =>

//convert date
function date(date) {
    var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
    var time =
        ("0" + date.getHours()).slice(-2) + ":" +
        ("0" + date.getMinutes()).slice(-2);
    return day + ' ' + monthNames[monthIndex] + ' ' + year + ' ' + time;
}