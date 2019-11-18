//construct requirements
const botconfig = require("./_config/bot_config.json");
const embed = require("./_config/embed.json");
const functions = require('./_config/functions');
const Discord = require("discord.js");
const fs = require('fs');

//client requirements
const client = new Discord.Client({ disableEveryone: true });
client.commands = new Discord.Collection();








// => Keeps the bot online
const http = require('http');
const express = require('express');
const app = express();
app.get("/", (request, response) => {
  response.sendStatus(200);
  // console.log(Date.now() + " Ping Received");
});
app.listen(process.env.PORT)
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 28000);









//// restAPI => ////
//construct dependencies
const cors = require('cors');
const helmet = require('helmet');

//adding Security
app.use(helmet());
app.use(cors());

let routes = require("./_restAPI/routes")(app);

//starting the server
app.listen(3000, () => {
    console.log("__")
    console.log("Starting train engines 3000...")
    console.log(functions.time(new Date()) + " - " + functions.date(new Date()))
    console.log("|")
});


//import all module commands
fs.readdir("./_commands/", (err, files) => {

    //define commandlist array
    let sero_commandlist_json = []

    //check for any errors
    if (err) console.log(err);

    //filter through all commands
    let jsfile = files.filter(f => f.split(".").pop() === "js")
    if (jsfile.length <= 0) {
        console.log("Couldn't find commands.");
        return;
    }

    //for each command, set name and add to list
    jsfile.forEach((f, i) => {
        let props = require(`./_commands/${f}`);
        sero_commandlist_json.push((i + 1) + ` - ${f}`)
        client.commands.set(props.help.name, props);
    })

    //write discordcommand array to JSON
    let sero_commandlist_data = JSON.stringify(sero_commandlist_json);
    fs.writeFileSync('./_server/sero_commandlist.json', sero_commandlist_data);

    //commands ready console message
    // console.log(sero_commandlist_json)
    console.log(`All ` + jsfile.length + ` train engines were started correctly!`);
    console.log("|")
});


client.on("ready", async () => {

    //define serverlist array
    let sero_serverlist_json = []

    //Ready message and connected servers
    console.log("Ready for " + client.guilds.size + " trainstations")
    client.guilds.forEach((guild) => {
        // console.log(" > station: " + guild.name + " - " + guild.id)
        sero_serverlist_json.push({
            "serverid": guild.id,
            "servername": guild.name
        })
    })

    //write discordcommand array to JSON
    let sero_serverlist_data = JSON.stringify(sero_serverlist_json);
    fs.writeFileSync('./_server/sero_serverlist.json', sero_serverlist_data);

    //console logs
    // console.log(sero_serverlist_json)
    console.log("|")

    //set username
    client.user.setUsername('Sero');

    //set activity
    client.user.setActivity('over ' + client.guilds.size + ' train stations || ns/help', { type: 'WATCHING' })
        .then(presence => console.log(`Bot activity set to: "Watching ${presence.game ? presence.game.name : 'none'}"`))
        .catch(console.error)

})


client.on("message", async message => {

    //default prefix
    let defaultprefix = botconfig.default_prefix
    let prefixes = JSON.parse(fs.readFileSync("./_server/prefixes.json", "utf8"))
    if (!prefixes[message.guild.id]) {
        prefixes[message.guild.id] = {
            prefixes: defaultprefix
        };
    }
    let prefix = prefixes[message.guild.id].prefixes

    //default channel
    let defaultchannel
    let dchannel = JSON.parse(fs.readFileSync("./_server/defaultchannel.json", "utf8"))
    if (!dchannel[message.guild.id]) {
        defaultchannel = ""
    } else {
        defaultchannel = dchannel[message.guild.id].defaultchannel
    }

    //ignore messages from bot itself & private messages
    if (message.author.bot) return
    if (message.channel.type === "dm") return
    if (defaultchannel) { if (message.channel.id != defaultchannel) return }

    //get prefix by mentioning bot
    if (message.isMentioned(client.user) && message.content == client.user) {
        message.channel.send("> Hello, my current prefix is `" + prefix + "` \n> For more information type `" + prefix + "help`")
    }

    //command processor
    let messageArray = message.content.split(" ")
    let cmd = messageArray[0]
    let args = messageArray.slice(1)

    //command handler
    if (!message.content.startsWith(prefix)) return;
    let commandfile = client.commands.get(cmd.slice(prefix.length));
    if (commandfile) commandfile.run(client, message, args);

})

client.login(process.env.TOKEN);