import { Client, Message } from 'discord.js'
import WOKCommands from '..'
import disabledCommands from '../models/disabled-commands'

export = {
  minArgs: 2,
  maxArgs: 2,
  cooldown: '2s',
  expectedArgs: '<"enable" or "disable"> <Command Name>',
  requiredPermissions: ['ADMINISTRATOR'],
  description: 'Enables or disables a command for this guild',
  category: 'Configuration',
  callback: async (
    message: Message,
    args: string[],
    text: string,
    client: Client,
    prefix: string,
    instance: WOKCommands
  ) => {
    const { guild } = message
    const newState = args.shift()?.toLowerCase()
    const name = (args.shift() || '').toLowerCase()

    if (!guild) {
      message.reply(
        instance.messageHandler.get(guild, 'CANNOT_ENABLE_DISABLE_IN_DMS')
      )
      return
    }

    if (newState !== 'enable' && newState !== 'disable') {
      message.reply(instance.messageHandler.get(guild, 'ENABLE_DISABLE_STATE'))
      return
    }

    const command = instance.commandHandler.getCommand(name)

    if (command) {
      const mainCommand = command.names[0]
      const isDisabled = command.isDisabled(guild.id)

      if (newState === 'enable') {
        if (!isDisabled) {
          message.reply(
            instance.messageHandler.get(guild, 'COMMAND_ALREADY_ENABLED')
          )
          return
        }

        await disabledCommands.deleteOne({
          guildId: guild.id,
          command: mainCommand,
        })

        command.enable(guild.id)

        message.reply(
          instance.messageHandler.get(guild, 'COMMAND_NOW_ENABLED', {
            COMMAND: mainCommand,
          })
        )
      } else {
        if (isDisabled) {
          message.reply(
            instance.messageHandler.get(guild, 'COMMAND_ALREADY_DISABLED')
          )
          return
        }

        await new disabledCommands({
          guildId: guild.id,
          command: mainCommand,
        }).save()

        command.disable(guild.id)

        message.reply(
          instance.messageHandler.get(guild, 'COMMAND_NOW_DISABLED', {
            COMMAND: mainCommand,
          })
        )
      }
    } else {
      message.reply(
        instance.messageHandler.get(guild, 'UNKNOWN_COMMAND', {
          COMMAND: name,
        })
      )
    }
  },
}
