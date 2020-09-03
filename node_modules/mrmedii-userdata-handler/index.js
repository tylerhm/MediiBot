'use strict'

const fs = require('fs');
let userData = require('./user_data.json');

const userTemplate = require('./user_template.json');
const userCatTemplate = require('./user_category_template.json');
const catTemplate = require('./category_template.json');

var client = undefined

exports.init = function(c) {
	saveUserData(true);
	client = c;
	client.on('message', onMessageHandler);
}

function onMessageHandler(target, context, msg, self) {

	if (self) return;
	if (msg[0] != '!') return;

	const cleanMsg = msg.trim().toLowerCase();
	const splitMsg = cleanMsg.split(' ');
	const paramLength = splitMsg.length;

	let commandName = undefined;
	let param1 = undefined;
	let param2 = undefined;

	let normalizedUser = undefined;
	let normalizedCat = undefined;

	switch (paramLength) {
		default:
		case 3:
			param2 = splitMsg[2];
		case 2:
			param1 = splitMsg[1];
			normalizedUser = forceAtSign(param1);
		case 1:
			commandName = splitMsg[0];
			normalizedCat = commandName.slice(1);
	}

    if (paramLength > 1) {
    	if (commandName.slice(-5) === 'count') {
    		const reqCategory = normalizedCat.slice(0, -5);
    		if (getUserData(target, normalizedUser, reqCategory, true))
    			return;
    	}
    	else {
    		if (modifyData(target, context, normalizedUser, normalizedCat))
    			return;
    	}
    }

    if (isSuperUser(context))
    {
    	switch(commandName) {
    		case '!addcategory':
    			addCategory(param1, param2);
    			break;
    		case '!removeuser':
    			removeUser(normalizedUser);
    			break;
    		case '!resetuserdata':
    			resetUserData();
    			break;
    	}
    }
}

function addCategory(cat, undo) {
	if (categoryExists(cat) != 'dne') {
		logError('Category ' + cat + ' already exists');
		return;
	}

	catTemplate.name = cat;
	catTemplate.undo = undo;
	userData.categories.push(JSON.parse(JSON.stringify(catTemplate)));
	log('Category ' + cat + ' has been created with undo ' + undo);
	saveUserData();
}

function modifyData(target, context, user, cat) {
	const catType = categoryExists(cat);

	switch (catType) {
		case 'dne':
			logError('Category ' + cat + ' does not exist');
			return false;
		case 'name':
			return incrementData(target, user, cat);
		case 'undo':
			return decrementData(target, context, user, cat);
	}
}

function incrementData(target, user, cat) {
	const validUser = userExists(user);

	if (validUser >= 0) {
		const validCat = userCatExists(validUser, cat);
		if (validCat >= 0) {
			userData.entries[validUser].data[validCat].count++;
			userData.entries[validUser].data[validCat]['last-use'] = getCurrentMillis();
			getUserData(target, user, cat, true);
			log(cat + ' was updated on user ' + user);
		}
		else
			addUserCat(validUser, user, cat)
	}
	else {
		addUser(user);
		addUserCat(userData.entries.length - 1, user, cat);
		getUserData(target, user, cat, true);
	}

	saveUserData();
	return true;
}

function decrementData(target, context, user, undo) {
	log(context.username);
	log(user.slice(1));
	if (context.username === user.slice(1)) {
		client.say(target, 'You alone cannot change your fate widepeepoHappy');
		return;
	}

	const validUser = userExists(user);

	if (validUser >= 0) {
		const cat = findUndoParent(undo);
		const validCat = userCatExists(validUser, cat);
		if (validCat >= 0) {
			const curTime = getCurrentMillis();
			if (curTime - userData.entries[validUser].data[validCat]['last-use'] <= 60000) {
				userData.entries[validUser].data[validCat].count--;
				userData.entries[validUser].data[validCat]['last-use'] = 0;
				getUserData(target, user, cat, false);
				log(cat + ' was updated on user ' + user);
			}
			else
				client.say(target, 'Yikes, you were too slow! PepeHands');
		}
		else {
			logError('User does not own decremented category');
			return false;
		}
	}
	else {
		logError('User does not exist, cannot decrement');
		return false;
	}

	saveUserData();
	return true;
}

function categoryExists(cat) {
	for (let index = 0; index < userData.categories.length; index++) {
		if (userData.categories[index].name === cat)
			return 'name';
		else if (userData.categories[index].undo === cat)
			return 'undo';
	}
	return 'dne';
}

function forceAtSign(user) {
	if (user[0] != '@')
		return '@' + user;

	let atStopage = 0;
	while (user[atStopage++] == '@') {}
		atStopage -= 2;
	return user.slice(atStopage);
}

function userExists(user) {
	for (let entry = 0; entry < userData.entries.length; entry++) {
		if (userData.entries[entry].name === user)
			return entry;
	}
	return -1;
}

function userCatExists(userIndex, cat) {
	for (let category = 0; category < userData.entries[userIndex].data.length; category++) {
		if (userData.entries[userIndex].data[category].category === cat)
			return category;
	}
	return -1;
}

function findUndoParent(undo) {
	for (let index = 0; index < userData.categories.length; index++) {
		if (userData.categories[index].undo === undo)
			return userData.categories[index].name;
	}
}

function addUser(user) {
	userTemplate.name = user;
	// string and parse for immutability
	userData.entries.push(JSON.parse(JSON.stringify(userTemplate)));
	log('New user ' + user + ' was created');
}

function addUserCat(userIndex, user, cat) {
	userCatTemplate.category = cat;
	userCatTemplate.count = 1;
	userCatTemplate['last-use'] = getCurrentMillis();
	// string and parse for immutability
	userData.entries[userIndex].data.push(JSON.parse(JSON.stringify(userCatTemplate)));
	log('Category ' + cat + ' added to user ' + user);
}

function getUserData(target, user, cat, isIncrement) {
	const validUser = userExists(user);

	if (validUser >= 0) {
		const validCat = userCatExists(validUser, cat);

		if (validCat >= 0) {
			if (isIncrement)
				client.say(target, user + ' has been ' + cat + 'ed ' + userData.entries[validUser].data[validCat].count + ' times mrmedi6Smirk');
			else
				client.say(target, user + '\'s last ' + cat + ' has been reversed! It is now ' + userData.entries[validUser].data[validCat].count + ' mrmedi6Pog');
		}
		else {
			logError('Category ' + cat + ' is not registered on user ' + user);
			return false;
		}
	}
	else {
		logError('User ' + user + ' does not exist');
		return false;
	}
	return true;
}

function removeUser(user) {
	const validUser = userExists(user);

	if (validUser >= 0) {
		userData.entries.splice(validUser, 1);
		log(user + ' has been removed');
	}
	else
		logError(user + ' does not exist');

	saveUserData();
}

function resetUserData() {
	const length = userData.entries.length;
	for (let i = 0; i < length; i++) {
		log(userData.entries[0].name + ' has been removed');
		userData.entries.splice(0, 1);
	}
	saveUserData();
	log('All users have been removed');
}

function saveUserData(bak) {
	let fileName = __dirname + '/user_data.json';
	if (bak)
		fileName = './user_data.json.bak';
	fs.writeFile(fileName, JSON.stringify(userData, null, 2), err => {
		if (err) {
			logFatal(`There was an error saving user_data.json...`);
			throw err;
		}
	});
	if (bak)
		log('user_data.json has been backed up to user_data.json.bak in your working directory');
	else
		log('user_data.json has been updated');
}

function getCurrentMillis() {
	let d = new Date();
	return d.getTime();
}

function isSuperUser(context) {
	return (context.username === 'mrmedii' || context.mod)
}

function log(msg) {
	const pref = 'udh ~ ';
	console.log(pref + msg);
}

function logError(msg) {
	const pref = 'udh ~ ERROR: ';
	console.log(pref + msg);
}

function logFatal(msg) {
	const pref = 'udh ~ FATAL: ';
	console.log(pref + msg);
}
