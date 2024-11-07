// src/bot/tests/discord.client.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DiscordClient } from '../discord.client';
import { Client, TextChannel } from 'discord.js';
import { IMission } from '../../core/domain/models/mission.model';
import { MissionStatus, MissionLocation } from '../../core/domain/interfaces/mission';

describe('DiscordClient', () => {
  let discordClient: DiscordClient;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      switch (key) {
        case 'DISCORD_TOKEN':
          return 'mock-token';
        case 'DISCORD_CHANNEL_ID':
          return 'mock-channel-id';
        default:
          return undefined;
      }
    }),
  };

  const mockMission: IMission = {
    id: 'test-id',
    title: 'Test Mission',
    description: 'Test Description',
    status: MissionStatus.PUBLISHED,
    dailyRateMin: 400,
    dailyRateMax: 600,
    location: MissionLocation.REMOTE,
    skills: ['React', 'TypeScript'],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscordClient,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    discordClient = module.get<DiscordClient>(DiscordClient);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('onModuleInit', () => {
    it('should throw error if DISCORD_TOKEN is not defined', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);
      await expect(discordClient.onModuleInit()).rejects.toThrow('DISCORD_TOKEN must be defined');
    });
  });

  describe('publishMission', () => {
    it('should successfully publish mission', async () => {
      const mockChannel = {
        send: jest.fn().mockResolvedValue({ id: 'message-id' }),
      } as unknown as TextChannel;

      jest.spyOn(discordClient['client'].channels, 'fetch')
        .mockResolvedValue(mockChannel);

      const messageId = await discordClient.publishMission(mockMission);
      expect(messageId).toBe('message-id');
      expect(mockChannel.send).toHaveBeenCalled();
    });

    it('should throw error if channel not found', async () => {
      jest.spyOn(discordClient['client'].channels, 'fetch')
        .mockResolvedValue(null);

      await expect(discordClient.publishMission(mockMission))
        .rejects.toThrow('Invalid Discord channel');
    });
  });
});