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
    try {
      return await this.prisma.questions.update({
        where: { id },
        data: updateQuestionDto,
      });
    } catch (error) {
      throw new Error('An error occurred while updating the question');
    }
  }

  async remove(id: string) {
    return await this.prisma.questions.delete({ where: { id } });
  }

  // TODO: This method is too slow due to the N+1 query problem.
  // It needs to be refactored to use a single Prisma query with `include`.
  async findAllWithAuthorDetails() {
    const list = await this.prisma.questions.findMany();

    const result = await Promise.all(
      list.map(async (question) => {
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

    return result;
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
