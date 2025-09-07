import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma, User } from 'generated/prisma';
import * as bcrypt from 'bcrypt';

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

  // Adicione este método
  async calculateUserStats(options: any) {
    // Simula uma operação complexa e ineficiente
    const users = await this.prisma.user.findMany();
    const questions = await this.prisma.questions.findMany();
    const answers = await this.prisma.answers.findMany();

    const data: any = {};
    data.totalUsers = users.length;
    data.totalQuestions = questions.length;
    data.totalAnswers = answers.length;
    data.averageQuestionsPerUser = questions.length / users.length;

    if (options && options.includeTopUser) {
      let topUser = null;
      let maxAnswers = -1;

      for (const user of users) {
        const userAnswers = answers.filter((a) => a.userId === user.id).length;
        if (userAnswers > maxAnswers) {
          maxAnswers = userAnswers;
          topUser = user.name;
        }
      }
      data.userWithMostAnswers = topUser;
    }

    if (options && options.mode === 'full') {
      const res = {
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'stats-endpoint',
        },
        report: data,
      };
      return res;
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
