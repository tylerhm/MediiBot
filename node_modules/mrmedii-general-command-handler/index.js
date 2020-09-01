'use strict';

const fs = require('fs');

var client = undefined;

exports.init = function(c) {
	client = c;
	client.on('message', onMessageHandler);
}

function onMessageHandler(target, context, msg, self) {

  // ignore messages from other bots
  if (self) return;


  const commName = msg.trim().toLowerCase().split()[0];

  // switch to find command
  switch (commName) {

    // basic chat commands
    case '!hi':
      client.say(target, 'yo Kapp');
      break;
	case '!skyhii':
	  client.say(target, 'HEY SKYHII IF YOU\'RE HERE REMIND ME TO MAKE THIS');
	  break;
	case '!sheep':
	  client.say(target, 'HEY SECURE IF YOU\'RE HERE REMIND TO MAKE THIS');
	  break;
  }
}
