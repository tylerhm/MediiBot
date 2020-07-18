const tmi = require("tmi.js");
const fs = require("fs");

// import current emoteData
let emoteData = require("./emote_usage.json");

// create backup emoteData file, in case of corruption
// save JSON with new data
fs.writeFile("emote_usage.json.bak", JSON.stringify(emoteData), err => {
  // check for errors
  if (err) throw err;

  console.log("~ Created minified emote backup at ./emote_usage.json.bak");
});

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
    handleEmotes(msg, context);
    return;
  }

  // remove whitespace from message, and then force lowercase
  const commandName = msg.trim().toLowerCase().split(" ")[0];
  console.log(commandName);

  // switch to find command
  switch (commandName) {

    // basic chat commands
    case "!hi":
      client.say(target, "yo Kapp");
      break;
    case "!8ball":
      eightBall(msg, target);
      break;

    // more in depth emote data commands (verifying ownership first)
    case "!emotedata":
      if (isMedii(context))
        respondEmoteStats(target);
      break;
    case "!resetemotedata":
      if (isMedii(context))
        resetEmoteData(target);
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

// count and register emote usage
function handleEmotes(msg, context) {
  // split string into tokenized array
  const tokenizedMsg = msg.split(" ");

  // process each word
  let emotesFound = 0;
  for (var wordIndex = 0; wordIndex < tokenizedMsg.length; wordIndex++) {
    emotesFound += checkEmote(tokenizedMsg[wordIndex], context);
  }

  if (emotesFound > 0)
    saveEmoteData();
}

// check if a word is an emote, and if so increment JSON
function checkEmote(str, context) {
  // check all emotes
  for (var iTier = 0; iTier < emoteData.numTiers; iTier++) {
    for (var iEmote = 0; iEmote < emoteData.tiers[iTier].num; iEmote++) {
      // found emote match
      if (str == emoteData.tiers[iTier].emotes[iEmote].name) {
        // increment data and log the used emote
        emoteData.tiers[iTier].emotes[iEmote].uses++;
        console.log("~ " + context["display-name"] + " has used " + emoteData.tiers[iTier].emotes[iEmote].name.substring(7)); // substring to remove emote prefix
        return 1;
      }
    }
  }
  return 0;
}

// prints usage data for all t1 emotes
function respondEmoteStats(target) {
  // check all t1 emotes
  for (var iEmote = 0; iEmote < emoteData.tiers[0].num; iEmote++)
    client.say(
      target,
      emoteData.tiers[0].emotes[iEmote].name +
        " : " +
        emoteData.tiers[0].emotes[iEmote].uses
    );
}

// saves our emote data to a JSON
function saveEmoteData() {
  // save JSON with new data
  fs.writeFile("emote_usage.json", JSON.stringify(emoteData, null, 2), err => {
    // check for errors
    if (err) {
      console.log(`FATAL: There was an error saving emote_usage.json...`);
      throw err;
    }
  });
}

// resets all emotes to 0
function resetEmoteData(target) {
  // reset ALL emotes
  for (var iTier = 0; iTier < emoteData.numTiers; iTier++)
    for (var iEmote = 0; iEmote < emoteData.tiers[iTier].num; iEmote++)
      emoteData.tiers[iTier].emotes[iEmote].uses = 0;

  saveEmoteData();

  console.log("~ Emote data has been reset.");
  client.say(target, "Emote data has been reset.");
}

// handle a raid message from streamlabs
function handleRaid(msg, target) {
  const tokenizedMsg = msg.split(" ");

  if (tokenizedMsg[1] === "just" && tokenizedMsg[2] === "raided")
    client.say(target, "!so " + tokenizedMsg[0]);
}

// generate a random eightball message and display it
function eightBall(msg, target) {
  // import possible 8ball reactions
  const eightBallResponses = require("./eightball.json");
  let randomMessageIndex = Math.floor(Math.random() * eightBallResponses.messages.length);
  client.say(target, eightBallResponses.messages[randomMessageIndex].message);
}