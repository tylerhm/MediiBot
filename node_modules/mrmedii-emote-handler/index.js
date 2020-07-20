'use strict';

const fs = require('fs');
let emoteData = require('./emote_data.json');

exports.respondEmoteStats = function(client, target) {
	emoteData[0].emotes.forEach(emote =>
		client.say(target, emote.name + ' : ' + emote.count));
}

exports.handleEmotes = function(msg, context) {
	const tokenizedMsg = msg.split(' ');

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
        exports.log(context['display-name'] + ' used ' + emoteData[iTier].emotes[iEmote].name);
        return 1;
      }
    }
  }
  return 0;
}

exports.saveEmoteData = function(bak) {
	let fileName = __dirname + '/emote_data.json';
	if (bak)
		fileName = './emote_data.json.bak';
	fs.writeFile(fileName, JSON.stringify(emoteData, null, 2), err => {
	    if (err) {
	      exports.logFatal(`There was an error saving emote_data.json...`);
	      throw err;
	    }
	  });
	if (bak)
		exports.log('emote_data.json has been backed up to emote_data.json.bak in your working directory')
	else
		exports.log('emote_data.json has been updated')
}

exports.resetEmoteData = function() {
	emoteData.forEach(tier =>
		tier.emotes.forEach(emote =>
			emote.count = 0));

  exports.saveEmoteData();

  exports.log('Emote data has been reset');
}

exports.log = function(msg) {
	const pref = 'eh ~ ';
	console.log(pref + msg);
}

exports.logError = function(msg) {
	const pref = 'eh ~ ERROR: ';
	console.log(pref + msg);
}

exports.logFatal = function(msg) {
	const pref = 'eh ~ FATAL: ';
	console.log(pref + msg);
}