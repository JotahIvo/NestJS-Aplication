import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async create(createQuestionDto: CreateQuestionDto, userId: string) {
    return await this.prisma.questions.create({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      data: { ...createQuestionDto, userId: userId },
    });
  }

  async findAll(params: { page: number; pageSize: number }) {
    const { page, pageSize } = params;
    const skip = (page - 1) * pageSize;

    const [questions, total] = await this.prisma.$transaction([
      this.prisma.questions.findMany({
        skip,
        take: pageSize,
        select: {
          id: true,
          title: true,
          body: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              answers: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.questions.count(),
    ]);

    return {
      data: questions,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    };
  }

  async findOne(id: string) {
    return await this.prisma.questions.findUnique({
      where: { id },
      include: {
        answers: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto, userId: string) {
    const question = await this.prisma.questions.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID "${id}" not found`);
    }

    if (question.userId !== userId) {
      throw new ForbiddenException('You are not allowed to update this question');
    }

    return this.prisma.questions.update({
      where: { id },
      data: updateQuestionDto,
    });
  }

  async remove(id: string, userId: string) {
    const question = await this.prisma.questions.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID "${id}" not found`);
    }

    if (question.userId !== userId) {
      throw new ForbiddenException('You are not allowed to delete this question');
    }
    
    return this.prisma.questions.delete({ where: { id } });
  }

  async findAllWithAuthorDetails() {
    return this.prisma.questions.findMany({
      select: {
        id: true,
        title: true,
        body: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async searchByTitle(term: string) {
    return this.prisma.questions.findMany({
      where: {
        title: {
          contains: term,
          mode: 'insensitive', 
        },
      },
    });
  }
}
