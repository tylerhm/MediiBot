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
        client.say(target, 'SKY REMIND ME TO MAKE THIS!!');
        break;
	case '!sheep':
        client.say(target, 'Love is stored in the sheep <3');
        break;
    case '!gautam':
        client.say(target, 'Hype Conductor thirsting for channel points!');
        break;
    case '!amerikia':
        client.say(target, 'Trust me, I work at Taco Bell :taco:');
        break;
    case '!reb':
        client.say(target, 'he\'s just ok');
        break;
    case '!azrael':
        client.say(target, 'Death has come to claim your soul.');
        break;
    case '!aeria':
        client.say(target, 'The best sis there is - reb');
        break;
  }
}
