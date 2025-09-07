import {
  ForbiddenException,
  Injectable,
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
        where: { deletedAt: null }, // Adicionado filtro
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
      this.prisma.questions.count({ where: { deletedAt: null } }), // Adicionado filtro
    ]);

    return {
      data: questions,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    };
  }

  async findOne(id: string) {
    return await this.prisma.questions.findUnique({
      where: { id, deletedAt: null }, // Adicionado filtro
      include: {
        answers: { where: { deletedAt: null } },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    // A verificação de propriedade foi removida daqui
    const question = await this.prisma.questions.findFirst({
      where: { id, deletedAt: null },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID "${id}" not found`);
    }

    return this.prisma.questions.update({
      where: { id },
      data: updateQuestionDto,
    });
  }

  async remove(id: string) {
    const question = await this.prisma.questions.findFirst({
      where: { id, deletedAt: null },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID "${id}" not found`);
    }

    return this.prisma.questions.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findAllWithAuthorDetails() {
    return this.prisma.questions.findMany({
      where: { deletedAt: null },
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
        deletedAt: null, // Adicionado filtro
      },
    });
  }
}
