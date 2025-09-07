import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma, User } from 'generated/prisma';
import * as bcrypt from 'bcrypt';
import { GetUserStatsDto } from './dtos/getUserStats.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<Omit<User, 'password'> | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      select: {
        id: true,
        email: true,
        name: true,
        password: false,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async createUser(data: any) {
    // Hashes the user's password before saving
    const hashPassword = await bcrypt.hash(data.password, 10);
    console.log(hashPassword);

    return this.prisma.user.create({
      data: { ...data, password: hashPassword },
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({ data, where });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
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
