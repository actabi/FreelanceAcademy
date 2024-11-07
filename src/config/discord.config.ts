// src/config/discord.config.ts
export default () => ({
  discord: {
    token: process.env.DISCORD_TOKEN,
    channelId: process.env.DISCORD_CHANNEL_ID,
  },
});
