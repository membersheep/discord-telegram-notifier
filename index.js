#!/usr/bin/node

"use strict";

const Discord = require('discord.js'), Telegram = require('node-telegram-bot-api'), logger = require('winston');
const config = require('./config.json');
const tg = new Telegram(config.telegram.token, { polling: true });
const dc = new Discord.Client();
logger.level = config.loglevel;

// Discord connection
dc.on('ready', function() {
    logger.info('[discord] connected!');
});
dc.login(config.discord.token);
dc.on('diconnect', function() {
    logger.warn('[discord] disconnect!... retrying');
    dc.login(config.discord.token);
});

// Discord events
dc.on('debug', function(info) {
    logger.info(info);
});

dc.on('message', function(message) {
    logger.info(message + ' received');
});

// Telegram commands
const usersReducer = function(currentValue, user) {
    if (user.presence.status == 'online') {
        return currentValue + ' ' + user.username;
    }
    return currentValue;
};

tg.on('message', function(message){
    logger.debug('[telegram-%s]: <%s> %s', message.chat.title, message.from.username, message.text);
    if (message.text.startsWith("/discord")) {
        return;
    }
    var message_out = 'users: ' + dc.users.reduce(usersReducer);
    logger.info(message_out);
    tg.sendMessage(message.chat.id, message_out);
});