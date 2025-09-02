import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/database/prisma.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock das dependências
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
  },
};

const mockJwtService = {
  signAsync: jest.fn(),
};

// Mock do bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks(); // Limpa os mocks antes de cada teste
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should return an access token on successful login', async () => {
      const user = { id: '1', email: 'test@test.com', password: 'hashedpassword' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('mock_token');

      const result = await service.signIn({ email: 'test@test.com', password: 'password', name: '' });
      expect(result).toEqual({ access_token: 'mock_token' });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedpassword');
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({ sub: '1' });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.signIn({ email: 'nouser@test.com', password: 'password', name: '' })).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const user = { id: '1', email: 'test@test.com', password: 'hashedpassword' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.signIn({ email: 'test@test.com', password: 'wrongpassword', name: '' })).rejects.toThrow(UnauthorizedException);
    });
  });
});