'use strict';

const fs = require('fs');
let emoteData = require('./emote_data.json');

var client = undefined;

exports.init = function(c) {
	saveEmoteData(true);
	client = c;
	client.on('message', onMessageHandler);
}

function onMessageHandler(target, context, msg, self) {

	if (self) return;

	if (msg[0] != '!') handleEmotes(msg, context);
}

function respondEmoteStats(client, target) {
	emoteData[0].emotes.forEach(emote =>
		client.say(target, emote.name + ' : ' + emote.count));
}

function handleEmotes(msg, context) {
	const tokenizedMsg = msg.split(' ');

	let emotesFound = 0;
	tokenizedMsg.forEach(tok =>
		emotesFound += checkEmote(tok, context));

	if (emotesFound > 0)
		saveEmoteData();
}

function checkEmote(tok, context) {
  for (var iTier = 0; iTier < emoteData.length; iTier++) {
    for (var iEmote = 0; iEmote < emoteData[iTier].emotes.length; iEmote++) {
      if (tok == emoteData[iTier].emotes[iEmote].name) {
        emoteData[iTier].emotes[iEmote].count++;
        log(context['display-name'] + ' used ' + emoteData[iTier].emotes[iEmote].name);
        return 1;
      }
    }
  }
  return 0;
}

function saveEmoteData(bak) {
	let fileName = __dirname + '/emote_data.json';
	if (bak)
		fileName = './emote_data.json.bak';
	fs.writeFile(fileName, JSON.stringify(emoteData, null, 2), err => {
	    if (err) {
	      logFatal(`There was an error saving emote_data.json...`);
	      throw err;
	    }
	  });
	if (bak)
		log('emote_data.json has been backed up to emote_data.json.bak in your working directory')
	else
		log('emote_data.json has been updated')
}

function resetEmoteData() {
	emoteData.forEach(tier =>
		tier.emotes.forEach(emote =>
			emote.count = 0));

  saveEmoteData();

  log('Emote data has been reset');
}

function log(msg) {
	const pref = 'eh ~ ';
	console.log(pref + msg);
}

function logError(msg) {
	const pref = 'eh ~ ERROR: ';
	console.log(pref + msg);
}

function logFatal(msg) {
	const pref = 'eh ~ FATAL: ';
	console.log(pref + msg);
}