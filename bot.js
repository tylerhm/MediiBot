const tmi = require("tmi.js");
const fs = require("fs");
const emoteHandler = require("twitch-emote-handler");

emoteHandler.saveEmoteData(true);

// important connectionInfo
const connectionInfo = require("../OAUTH/connectionInfo.json");

// open a client with connectionInfo
const client = new tmi.client(connectionInfo);

// Register our event handlers (defined below)
client.on("message", onMessageHandler);
client.on("connected", onConnectedHandler);

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

  // if its streamlabs, check for raid message
  if (context["display-name"] === "Streamlabs") {
    handleRaid(msg, target);
    return;
  }
  
  // if it's not a command, check emotes and don't check command
  if (msg[0] != "!") {
    emoteHandler.handleEmotes(msg, context);
    return;
  }

  // remove whitespace on outside from message, and then force lowercase
  const cleanComm = msg.trim().toLowerCase();
  const commandName = cleanComm.split(" ")[0];
  console.log("~ " + context["display-name"] + " used " + commandName);

  // switch to find command
  switch (commandName) {

    // basic chat commands
    case "!hi":
      client.say(target, "yo Kapp");
      break;
    case "!8ball":
      eightBall(target);
      break;

    // more in depth emote data commands (verifying ownership first)
    case "!emotedata":
      if (isMedii(context))
        respondEmoteStats(target);
      break;
    case "!resetemotedata":
      if (isMedii(context))
        emoteHandler.resetEmoteData(target);
      else
        console.log("~ " + context["display-name"] + " attempted to reset emote data.");
      break;

    // if an !command is run without 
    default:
      console.log(`~ Unknown command used ${commandName}`);
      break;
  }
}

// returns true, if we are Medii
function isMedii(context) {
  return (context["display-name"] === "MrMedii")
}

// prints usage data for all t1 emotes
function respondEmoteStats(target) {
  // check all t1 emotes
  emoteData[0].emotes.forEach(emote => 
    client.say(target, emote.name + " : " + emote.count));
}


// handle a raid message from streamlabs
function handleRaid(msg, target) {
  const tokenizedMsg = msg.split(" ");

  if (tokenizedMsg[1] === "just" && tokenizedMsg[2] === "raided")
    client.say(target, "!so " + tokenizedMsg[0]);
}

// generate a random eightball message and display it
function eightBall(target) {
  // import possible 8ball reactions
  const eightBallResponses = require("./eightball.json");
  let randomMessageIndex = Math.floor(Math.random() * eightBallResponses.length);
  client.say(target, eightBallResponses[randomMessageIndex]);
}