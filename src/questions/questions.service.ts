import { Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async create(createQuestionDto: CreateQuestionDto, req: any) {
    return await this.prisma.questions.create({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      data: { ...createQuestionDto, userId: req.sub.sub },
    });
  }

  async findAll() {
    return await this.prisma.questions.findMany({
      include: { answers: true },
    });
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

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    return await this.prisma.questions.update({
      where: { id },
      data: updateQuestionDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.questions.delete({ where: { id } });
  }

  async findAllWithAuthorDetails() {
    const questions = await this.prisma.questions.findMany();

    const detailedQuestions = await Promise.all(
      questions.map(async (question) => {
        const author = await this.prisma.user.findUnique({
          where: { id: question.userId },
          select: { name: true },
        });
        return {
          id: question.id,
          title: question.title,
          body: question.body,
          authorName: author ? author.name : 'Unknown',
        };
      }),
    );

    return detailedQuestions;
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
