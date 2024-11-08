// src/bot/tests/commands/profile.command.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ProfileCommand } from '../../bot/commands/profile.command';
import { FreelanceService } from '../../core/services/freelance.service';
import { CommandInteraction } from 'discord.js';

describe('ProfileCommand', () => {
  let command: ProfileCommand;
  let freelanceService: FreelanceService;

  const mockFreelanceService = {
    findByDiscordId: jest.fn(),
    updateProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileCommand,
        {
          provide: FreelanceService,
          useValue: mockFreelanceService,
        },
      ],
    }).compile();

    command = module.get<ProfileCommand>(ProfileCommand);
    freelanceService = module.get<FreelanceService>(FreelanceService);
  });

  describe('execute', () => {
    it('should handle view profile subcommand', async () => {
      const interaction = {
        options: {
          getSubcommand: () => 'view',
        },
        user: {
          id: 'test-user-id',
        },
        reply: jest.fn(),
        isChatInputCommand: () => true,
      } as unknown as CommandInteraction;

      mockFreelanceService.findByDiscordId.mockResolvedValue({
        name: 'Test User',
        dailyRate: 500,
        skills: ['TypeScript', 'React'],
        isAvailable: true,
      });

      await command.execute(interaction);
      
      expect(interaction.reply).toHaveBeenCalled();
      expect(freelanceService.findByDiscordId).toHaveBeenCalledWith('test-user-id');
    });
  });
});