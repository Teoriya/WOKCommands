"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const channel_commands_1 = __importDefault(require("../models/channel-commands"));
module.exports = {
    minArgs: 1,
    expectedArgs: '<Command name> [Channel tags OR "none"]',
    cooldown: '2s',
    requiredPermissions: ['ADMINISTRATOR'],
    guildOnly: true,
    description: 'Makes a command only work in some channels.',
    category: 'Configuration',
    callback: async (options) => {
        const { message, args, instance } = options;
        const { guild } = message;
        const { messageHandler } = instance;
        let commandName = (args.shift() || '').toLowerCase();
        const command = instance.commandHandler.getICommand(commandName);
        if (!command || !command.names) {
            message.reply(messageHandler.get(guild, 'UNKNOWN_COMMAND', {
                COMMAND: commandName,
            }));
            return;
        }
        commandName = command.names[0];
        const action = args[0];
        if (action && action.toLowerCase() === 'none') {
            const results = await channel_commands_1.default.deleteMany({
                guildId: guild?.id,
                command: commandName,
            });
            if (results.n === 0) {
                message.reply(messageHandler.get(guild, 'NOT_CHANNEL_COMMAND'));
            }
            else {
                message.reply(messageHandler.get(guild, 'NO_LONGER_CHANNEL_COMMAND'));
            }
            return;
        }
        if (message.mentions.channels.size === 0) {
            message.reply(messageHandler.get(guild, 'NO_TAGGED_CHANNELS'));
            return;
        }
        await channel_commands_1.default.findOneAndUpdate({
            guildId: guild?.id,
            command: commandName,
        }, {
            guildId: guild?.id,
            command: commandName,
            $addToSet: {
                channels: Array.from(message.mentions.channels.keys()),
            },
        }, {
            upsert: true,
        });
        message.reply(messageHandler.get(guild, 'NOW_CHANNEL_COMMAND', {
            COMMAND: commandName,
            CHANNELS: args.join(' '),
        }));
    },
};
