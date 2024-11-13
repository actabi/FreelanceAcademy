// src/config/discord.config.ts
export default () => ({
  discord: {
    token: process.env.DISCORD_TOKEN,
    channelId: process.env.DISCORD_CHANNEL_ID,
    guildId: process.env.DISCORD_GUILD_ID, // Ajout du guildId
    clientId: process.env.DISCORD_CLIENT_ID
  },
});