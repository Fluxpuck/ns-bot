//construct bot requirements
const botconfig = require("./botconfig.json")
const defaultconfig = require("./_server/default-config.json")
const Discord = require("discord.js")
const fetch = require("node-fetch");
const fs = require('fs');
const client = new Discord.Client({ disableEveryone: true })
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

//command modules || command handler
client.commands = new Discord.Collection();

console.log("-----")

fs.readdir("./_commands/", (err, files) => {

    if (err) console.log(err);

    let jsfile = files.filter(f => f.split(".").pop() === "js")
    if (jsfile.length <= 0) {
        console.log("Couldn't find commands.");
        return;
    }

    console.log(`Commands loading... \n=>`)
    jsfile.forEach((f, i) => {
        let props = require(`./_commands/${f}`);
        console.log((i + 1) + ` - ${f} loaded!`);
        client.commands.set(props.help.name, props);
    })
  
    console.log(`=> \n` + jsfile.length + ` commands were loaded correctly!`);

});

client.on("ready", async () => {

    console.log("-----")

    //connection message    
    console.log(client.user.tag + " connected succesfully to:")

    //connected servers + channels
    client.guilds.forEach((guild) => {
        console.log("server: " + guild.name)

        //connected channels
        // guild.channels.forEach((channel) => {
        //     console.log(` -- ${channel.name} (${channel.type}) - ${channel.id}`)
        // })
    })

    //bot activity
    client.user.setActivity('with Trains || !help', { type: 'PLAYING' })
        // .then(presence => console.log(`Bot activity set to ${presence.game ? presence.game.name : 'none'}`))
        .catch(console.error)

})

client.on("message", async message => {

    //default botconfig
    let versioncontrol = botconfig.version
    let defaultprefix = botconfig.prefix

    //default prefix
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
    if (defaultchannel) {
        if (message.channel.id != defaultchannel) return
    } else { }

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