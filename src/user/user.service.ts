import { Injectable } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma';
import * as bcrypt from 'bcrypt';
import { GetUserStatsDto } from './dtos/getUserStats.dto';
import { UserRepository } from './user.repository';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private prisma: PrismaService,
  ) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepository.findOne(userWhereUniqueInput);
    if (!user) return null;
    const { password, ...result } = user;
    return result;
  }

  async createUser(data: Prisma.UserCreateInput) {
    const hashPassword = await bcrypt.hash(data.password, 10);
    return this.userRepository.create({ ...data, password: hashPassword });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    return this.userRepository.update(params);
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.userRepository.delete(where);
  }

  async calculateUserStats(options: GetUserStatsDto) {    
    // All calculations are now done efficiently in the database.
    const [totalUsers, totalQuestions, totalAnswers] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.questions.count(),
      this.prisma.answers.count({ where: { deletedAt: null } }),
    ]);

    const data: any = {
      totalUsers,
      totalQuestions,
      totalAnswers,
      averageQuestionsPerUser: totalUsers > 0 ? totalQuestions / totalUsers : 0,
    };

    if (options && options.includeTopUser) {
      const topUserAgg = await this.prisma.answers.groupBy({
        by: ['userId'],
        _count: {
          userId: true,
        },
        orderBy: {
          _count: {
            userId: 'desc',
          },
        },
        take: 1,
      });

      if (topUserAgg.length > 0) {
        const topUserId = topUserAgg[0].userId;
        const topUser = await this.prisma.user.findUnique({
          where: { id: topUserId },
          select: { name: true },
        });
        data.userWithMostAnswers = topUser?.name || null;
      } else {
        data.userWithMostAnswers = null;
      }
    }

    if (options && options.mode === 'full') {
      return {
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'stats-endpoint',
        },
        report: data,
      };
    }

    return data;
  }

  async searchUsersRaw(name: string) {
    // Using Prisma.sql template literal for parameterized query to prevent SQL injection
    const result = await this.prisma.$queryRaw(
      Prisma.sql`SELECT id, name, email FROM "User" WHERE name = ${name}`,
    );
    return result;
  }
}
