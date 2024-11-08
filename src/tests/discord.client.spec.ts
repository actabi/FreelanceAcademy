// src/tests/discord.client.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DiscordClient } from '../bot/discord.client';
import { TextChannel } from 'discord.js';
import { IMission, MissionStatus, MissionLocation } from '../core/domain/interfaces/mission.interface';

describe('DiscordClient', () => {
  let discordClient: DiscordClient;
  let configService: ConfigService;

  // Mock du ConfigService
  const mockConfigService = {
    get: jest.fn((key: string) => {
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

  // Mock d'une mission
  const mockMission: IMission = {
    id: 'test-id',
    title: 'Test Mission',
    description: 'Test Description',
    status: MissionStatus.PUBLISHED,
    dailyRateMin: 400,
    dailyRateMax: 600,
    location: MissionLocation.REMOTE,
    skills: [], // Un tableau vide pour les skills
    createdAt: new Date(),
    updatedAt: new Date(),
    // Champs optionnels
    startDate: undefined,
    endDate: undefined,
    companyName: undefined,
    address: undefined,
    discordMessageId: undefined,
    applications: [] // Add an empty array for applications
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

    // Mock des méthodes du client Discord
    jest.spyOn(discordClient['client'], 'login').mockResolvedValue('mock-token');
  });

  describe('onModuleInit', () => {
    it('should throw error if DISCORD_TOKEN is not defined', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);
      await expect(discordClient.onModuleInit()).rejects.toThrow('DISCORD_TOKEN must be defined');
    });

    it('should successfully initialize with valid token', async () => {
      await expect(discordClient.onModuleInit()).resolves.not.toThrow();
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

    it('should throw error if channel ID not configured', async () => {
      jest.spyOn(configService, 'get')
        .mockImplementation((key) => key === 'DISCORD_TOKEN' ? 'mock-token' : undefined);

      await expect(discordClient.publishMission(mockMission))
        .rejects.toThrow('DISCORD_CHANNEL_ID must be defined');
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});