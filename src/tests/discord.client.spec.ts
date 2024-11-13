// src/tests/discord.client.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DiscordClient } from '../bot/discord.client';
import { TextChannel, Client } from 'discord.js';
import { IMission } from '../core/domain/interfaces/mission.interface';
import { MissionStatus, MissionLocation } from '../core/domain/enums/mission.enums';

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
        case 'DISCORD_CLIENT_ID':
          return 'mock-client-id';
        case 'ENABLE_DISCORD':
          return 'true';
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
    skills: [],
    applications: [],
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

    // Mock des méthodes du client Discord
    const mockClient = {
      login: jest.fn().mockResolvedValue('logged-in'),
      channels: {
        fetch: jest.fn(),
      },
      users: {
        fetch: jest.fn(),
      },
    } as unknown as Client;

    // @ts-ignore - Assigner le mock client
    discordClient['client'] = mockClient;
  });

  describe('publishMission', () => {
    it('should successfully publish mission', async () => {
      const mockMessage = { id: 'message-id' };
      const mockChannel = {
        send: jest.fn().mockResolvedValue(mockMessage),
      } as unknown as TextChannel;

      // @ts-ignore - Mock fetch method
      discordClient['client'].channels.fetch.mockResolvedValue(mockChannel);

      const messageId = await discordClient.publishMission(mockMission);
      expect(messageId).toBe('message-id');
      expect(mockChannel.send).toHaveBeenCalled();
    });

    it('should throw error if channel not found', async () => {
      // @ts-ignore - Mock fetch method to return null
      discordClient['client'].channels.fetch.mockResolvedValue(null);

      await expect(discordClient.publishMission(mockMission))
        .rejects.toThrow('Invalid Discord channel');
    });

    it('should throw error if channel ID not configured', async () => {
      jest.spyOn(configService, 'get').mockImplementation((key) => {
        if (key === 'DISCORD_CHANNEL_ID') return undefined;
        return mockConfigService.get(key);
      });

      await expect(discordClient.publishMission(mockMission))
        .rejects.toThrow('DISCORD_CHANNEL_ID must be defined');
    });
  });

  describe('sendDirectMessage', () => {
    it('should successfully send DM to user', async () => {
      const mockUser = {
        send: jest.fn().mockResolvedValue({}),
      };

      // @ts-ignore - Mock fetch method
      discordClient['client'].users.fetch.mockResolvedValue(mockUser);

      await discordClient.sendDirectMessage('user-id', 'test message');
      expect(mockUser.send).toHaveBeenCalledWith('test message');
    });

    it('should throw error if user not found', async () => {
      // @ts-ignore - Mock fetch method to return null
      discordClient['client'].users.fetch.mockResolvedValue(null);

      await expect(discordClient.sendDirectMessage('user-id', 'test message'))
        .rejects.toThrow('User not found: user-id');
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});