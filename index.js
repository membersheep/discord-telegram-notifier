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

// Telegram events

const onTelegramMessage = function(message) {
    logger.debug('[telegram-%s]: <%s> %s', message.chat.title, message.from.username, message.text);
    if (!message.text.startsWith('/discord')) {
        return;
    }
    var message_out = 'Online users: ';
    var usersList = '';
    dc.users.forEach(function(user, key, map) {
        if (user.bot == true) {
            return;
        }
        var game = '';
        if (user.game != null) {
            game = '(' + user.game.name + ')';
        }
        if (user.presence.status == 'online') {
            usersList = usersList + ' ' + user.username + game;
        }
    });
    if (usersList != '') {
        message_out = message_out + usersList;
    } else {
        message_out = message_out + 'none';
    }
    logger.info(message_out);
    tg.sendMessage(message.chat.id, message_out);
};


tg.on('message', onTelegramMessage);
