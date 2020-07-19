'use strict';

let fs = require("fs");

let emoteData = require("./emote_data.json");

exports.handleEmotes = function(msg, context) {
	const tokenizedMsg = msg.split(" ");

	let emotesFound = 0;
	tokenizedMsg.forEach(tok =>
		emotesFound += exports.checkEmote(tok, context));

	if (emotesFound > 0)
		exports.saveEmoteData();
}

exports.checkEmote = function(tok, context) {
  for (var iTier = 0; iTier < emoteData.length; iTier++) {
    for (var iEmote = 0; iEmote < emoteData[iTier].emotes.length; iEmote++) {
      if (tok == emoteData[iTier].emotes[iEmote].name) {
        emoteData[iTier].emotes[iEmote].count++;
        console.log("~ " + context["display-name"] + " used " + emoteData[iTier].emotes[iEmote].name);
        return 1;
      }
    }
  }
  return 0;
}

exports.saveEmoteData = function(bak) {
	let fileName = "emote_usage.json";
	if (bak) fileName += ".bak"; 
	fs.writeFile("emote_usage.json", JSON.stringify(emoteData, null, 2), err => {
	    if (err) {
	      console.log(`FATAL: There was an error saving emote_usage.json...`);
	      throw err;
	    }
	  });
}

exports.resetEmoteData = function() {
	emoteData.forEach(tier =>
		tier.emotes.forEach(emote =>
			emote.count = 0));

  exports.saveEmoteData();

  console.log("~ Emote data has been reset.");
}