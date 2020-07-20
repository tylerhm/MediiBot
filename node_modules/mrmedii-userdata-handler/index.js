'use strict'

const fs = require('fs');
let userData = require('./user_data.json');

const userTemplate = require('./user_template.json');
const catTemplate = require('./category_template.json');

exports.addCategory = function(cat) {
	if (exports.categoryExists(cat)) {
		exports.logError('Category ' + cat + ' already exists');
		return;
	}

	userData.categories.push(cat);
	exports.log('Category ' + cat + ' has been created');
	exports.saveUserData();
}

exports.incrementData = function(user, cat) {
	if (!exports.categoryExists(cat)) {
		exports.logError('Category ' + cat + ' does not exist');
		return false;
	}

	const validUser = exports.userExists(user);

	if (validUser >= 0) {
		const validCat = exports.userCatExists(validUser, cat);
		if (validCat >= 0) {
			userData.entries[validUser].data[validCat].count++;
			exports.log(cat + ' was updated on user ' + user);
		}
		else
			exports.addUserCat(validUser, user, cat)
	}
	else {
		exports.addUser(user);
		exports.addUserCat(userData.entries.length - 1, user, cat);
	}

	exports.saveUserData();
	return true;
}

exports.categoryExists = function(cat) {
	if (userData.categories.includes(cat)) 
		return true;
	return false;
}

exports.userExists = function(user) {
	for (let entry = 0; entry < userData.entries.length; entry++)
		if (userData.entries[entry].name === user)
			return entry;
	return -1;
}

exports.userCatExists = function(userIndex, cat) {
	for (let category = 0; category < userData.entries[userIndex].data.length; category++)
		if (userData.entries[userIndex].data[category].category === cat)
			return category;
	return -1;
}

exports.addUser = function(user) {
	userTemplate.name = user;
	// string and parse for immutability
	userData.entries.push(JSON.parse(JSON.stringify(userTemplate)));
	exports.log('New user ' + user + ' was created');
}

exports.addUserCat = function(userIndex, user, cat) {
	catTemplate.category = cat;
	catTemplate.count = 1;
	// string and parse for immutability
	userData.entries[userIndex].data.push(JSON.parse(JSON.stringify(catTemplate)));
	exports.log('Category ' + cat + ' added to user ' + user);
}

exports.getUserData = function(client, target, user, cat) {
	const validUser = exports.userExists(user);

	if (validUser >= 0) {
		const validCat = exports.userCatExists(validUser, cat);

		if (validCat >= 0)
			client.say(target, user + ' has been ' + cat + 'ed ' + userData.entries[validUser].data[validCat].count + ' times mrmedi6Smirk');
		else {
			exports.logError('Category ' + cat + ' is not registered on user ' + user);
			return false;
		}
	}
	else {
		exports.logError('User ' + user + ' does not exist');
		return false;
	}
	return true;
}

exports.removeUser = function(user) {
	const validUser = exports.userExists(user);

	exports.log(validUser);
	if (validUser >= 0) {
		userData.entries.splice(validUser, 1);
		exports.log(user + ' has been removed');
	}
	else 
		exports.logError(user + ' does not exist');
}

exports.resetUserData = function () {
	const length = userData.entries.length;
	for (let i = 0; i < length; i++) {
		exports.log(userData.entries[0].name + ' has been removed');
		userData.entries.splice(0, 1);
	}
	exports.saveUserData();
	exports.log('All users have been removed');
}

exports.saveUserData = function(bak) {
	let fileName = __dirname + '/user_data.json';
	if (bak)
		fileName = './user_data.json.bak';
	fs.writeFile(fileName, JSON.stringify(userData, null, 2), err => {
	    if (err) {
	      exports.logFatal(`There was an error saving user_data.json...`);
	      throw err;
	    }
	  });
	if (bak)
		exports.log('user_data.json has been backed up to user_data.json.bak in your working directory');
	else
		exports.log('user_data.json has been updated');
}

exports.log = function(msg) {
	const pref = 'udh ~ ';
	console.log(pref + msg);
}

exports.logError = function(msg) {
	const pref = 'udh ~ ERROR: ';
	console.log(pref + msg);
}

exports.logFatal = function(msg) {
	const pref = 'udh ~ FATAL: ';
	console.log(pref + msg);
}