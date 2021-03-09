import { Client } from 'discord.js'

module.exports = (client: Client) => {
  client.on('message', (message) => {
    client.emit('messageUpsert', message)
  })

  client.on('messageUpdate', (oldMessage, newMessage) => {
    client.emit('messageUpsert', oldMessage, newMessage)
  })
}
