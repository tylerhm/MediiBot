const tmi = require("tmi.js");
const fs = require("fs");

// import current emoteData
let emoteData = require("./emote_usage.json");

// important connectionInfo
const connectionInfo = {
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.OAUTH_TOKEN
  },
  channels: [process.env.CHANNEL_NAME]
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
  // ignore messages from the bot
  if (self) return;

  // check and handle emotes
  handleEmotes(msg);

  // if it's not a command, don't check anything
  if (msg[0] != "!") return;

  // remove whitespace from message, and then force lowercase
  const commandName = msg.trim().toLowerCase();

  // switch to find command
  switch (commandName) {
    case "!hi":
      client.say(target, "yo Kapp");
      break;
    case "!emotestats":
      respondEmoteStats(target);
      break;
    default:
      console.log(`~~ Unknown command used ${commandName}`);
      break;
  }
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

    console.log("Saved Emote Stats");
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
  // check all emotes
  for (var iTier = 0; iTier < emoteData.numTiers; iTier++) {
    for (var iEmote = 0; iEmote < emoteData.tiers[iTier].num; iEmote++)
      client.say(
        target,
        emoteData.tiers[iTier].emotes[iEmote].name +
          " : " +
          emoteData.tiers[iTier].emotes[iEmote].uses
      );
  }
}
