// import packages

const tmi = require('tmi.js');
const fs = require('fs');
const emoteHandler = require('mrmedii-emote-handler');
const userDataHandler = require('mrmedii-userdata-handler');
const commHandler = require('mrmedii-general-command-handler');

// important connectionInfo
const connectionInfo = require('../OAUTH/connectionInfo.json');

// open a client with connectionInfo
const client = new tmi.client(connectionInfo);

userDataHandler.init(client);
emoteHandler.init(client);
commHandler.init(client);

// Register our event handlers (defined below)
//client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
//client.on('raided', onRaidHandler);

// Connect to Twitch:
client.connect();

// called on connection to twitch chat
function onConnectedHandler(addr, port) {
  console.log(`~ MediiBot has successfully connected to ${addr}:${port}`);
}

// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {
  // ignore messages from other bots
  if (self) return;


  const cleanComm = msg.trim().toLowerCase();
  const commSplit = cleanComm.split(' ');
  const twoPart = commSplit.length > 1;
  const commandName = commSplit[0];
  let commandParam = '';

  if (twoPart)
    commandParam = commSplit[1];

    switch(commandName) {
        case '!8ball':
            eightBall(target);
            break;
    }
}


// returns true, if we are Medii
function isMedii(context) {
  return (context['display-name'] === 'MrMedii')
}

// handle a raid message from streamlabs
function onRaidHandler(channel, username, viewers) {
    client.say(target, '!so ' + username);
}

// generate a random eightball message and display it
function eightBall(target) {
  // import possible 8ball reactions
  const eightBallResponses = require('./eightball.json');
  let randomMessageIndex = Math.floor(Math.random() * eightBallResponses.length);
  client.say(target, eightBallResponses[randomMessageIndex]);
}
