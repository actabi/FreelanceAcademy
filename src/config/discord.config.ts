// src/config/discord.config.ts
export default () => ({
  discord: {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    guildId: process.env.DISCORD_GUILD_ID,
    redirectUri: process.env.DISCORD_REDIRECT_URI,
    scopes: ['bot', 'applications.commands', 'applications.commands.permissions.update'],
    permissions: [
      'SEND_MESSAGES',
      'READ_MESSAGE_HISTORY',
      'USE_SLASH_COMMANDS',
      'MANAGE_WEBHOOKS',
      'VIEW_CHANNELS'
    ]
  },
});