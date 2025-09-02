import { Injectable } from '@nestjs/common';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { PrismaService } from 'src/database/prisma.service';
import { CreateAnswerDto } from './dto/create-answer.dto';

@Injectable()
export class AnswersService {
  constructor(private prisma: PrismaService) {}

  create(createAnswerDto: CreateAnswerDto, userId: any, questionId: string) {
    const newAnswer = {
      body: createAnswerDto.body,
      user: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        connect: { id: userId.sub },
      },
    };
    return this.prisma.answers.create({
      data: newAnswer,
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
    return this.prisma.answers.delete({ where: { id } });
  }
}
