const tmi = require("tmi.js");
const fs = require("fs");

// import current emoteData
let emoteData = require("./emote_usage.json");

// create backup emoteData file, in case of corruption
// save JSON with new data
fs.writeFile("emote_usage.json.bak", JSON.stringify(emoteData), err => {
  // check for errors
  if (err) throw err;

  console.log("Created backup at ./emote_usage.json.bak");
});

// important connectionInfo
const connectionInfo = {
  identity: {
    username: "robomedii",
    password: "oauth:v0ooxwylnwqas8m5zlowspebeva2ha"
  },
  channels: ["mrmedii"]
};

// open a client with connectionInfo
const client = new tmi.client(connectionInfo);

// Register our event handlers (defined below)
client.on("message", onMessageHandler);
client.on("connected", onConnectedHandler);

// Connect to Twitch:
client.connect();

// called on connection to twitch chat
function onConnectedHandler(addr, port) {
  console.log(`~~ MediiBot has successfully connected to ${addr}:${port}`);
}

// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {
  // ignore messages from other bots
  if (self || context["display-name"] === "Streamlabs") return;

  // check and handle emotes
  handleEmotes(msg);

  // if it's not a command, don't check anything
  if (msg[0] != "!") return;

  // remove whitespace from message, and then force lowercase
  const commandName = msg.trim().toLowerCase();

  // switch to find command
  switch (commandName) {
    case "!right":
      console.log("turning right!!!");
      break;
    case "!hi":
      client.say(target, "yo Kapp");
      break;
    case "!ping":
      client.say(target, "pong!");
      break;
    case "!emotedata":
      if (isMedii(context))
        respondEmoteStats(target);
      break;
    case "!resetemotedata":
      if (isMedii(context))
        resetEmoteData(target);
      break;
    default:
      console.log(`~~ Unknown command used ${commandName}`);
      break;
  }
}

// returns true, if we are Medii
function isMedii(context) {
  return (context["display-name"] === "MrMedii")
}

// count and register emote usage
function handleEmotes(msg) {
  // split string into tokenized array
  const tokenizedMsg = msg.split(" ");

  // process each word
  for (var wordIndex = 0; wordIndex < tokenizedMsg.length; wordIndex++) {
    let word = tokenizedMsg[wordIndex];

    checkEmote(word);
  }

  // save JSON with new data
  fs.writeFile("emote_usage.json", JSON.stringify(emoteData), err => {
    // check for errors
    if (err) throw err;
  });
}

// check if a word is an emote, and if so increment JSON
function checkEmote(str) {
  // check all emotes
  for (var iTier = 0; iTier < emoteData.numTiers; iTier++) {
    for (var iEmote = 0; iEmote < emoteData.tiers[iTier].num; iEmote++) {
      if (str == emoteData.tiers[iTier].emotes[iEmote].name) {
        emoteData.tiers[iTier].emotes[iEmote].uses++;
        return;
      }
    }
  }
}

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

function resetEmoteData(target) {
  // reset ALL emotes
  for (var iTier = 0; iTier < emoteData.numTiers; iTier++)
    for (var iEmote = 0; iEmote < emoteData.tiers[iTier].num; iEmote++)
      emoteData.tiers[iTier].emotes[iEmote].uses = 0;

  console.log("Emote data has been reset.");
  client.say(target, "Emote data has been reset.");
}