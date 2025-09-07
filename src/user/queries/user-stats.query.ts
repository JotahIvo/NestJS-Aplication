import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { GetUserStatsDto } from '../dtos/getUserStats.dto';

@Injectable()
export class UserStatsQueryHandler {
  constructor(private prisma: PrismaService) {}

  async execute(options: GetUserStatsDto) {
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
}
