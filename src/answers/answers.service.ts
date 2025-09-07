import { Injectable } from '@nestjs/common';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { PrismaService } from 'src/database/prisma.service';
import { CreateAnswerDto } from './dto/create-answer.dto';

@Injectable()
export class AnswersService {
  constructor(private prisma: PrismaService) {}

  create(createAnswerDto: CreateAnswerDto, userId: string, questionId: string) {
    return this.prisma.answers.create({
      data: {
        body: createAnswerDto.body,
        user: {
          connect: { id: userId },
        },
        question: {
          connect: { id: questionId },
        },
      },
    });
  }

  findAll() {
    return this.prisma.answers.findMany();
  }

  findOne(id: string) {
    return this.prisma.answers.findUnique({ where: { id } });
  }

  update(id: string, updateAnswerDto: UpdateAnswerDto) {
    return this.prisma.answers.update({ where: { id }, data: updateAnswerDto });
  }

  remove(id: string) {
    return this.prisma.answers.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
