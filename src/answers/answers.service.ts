import { Injectable } from '@nestjs/common';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { PrismaService } from 'src/database/prisma.service';
import { CreateAnswerDto } from './dto/create-answer.dto';

@Injectable()
export class AnswersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new answer for a given question.
   * @param createAnswerDto The data for the new answer.
   * @param userId The ID of the user creating the answer.
   * @param questionId The ID of the question being answered.
   * @returns The newly created answer.
   */
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

  /**
   * Retrieves all answers from the database.
   * @returns A list of all answers.
   */
  findAll() {
    return this.prisma.answers.findMany();
  }

  /**
   * Retrieves a single answer by its unique ID.
   * @param id The ID of the answer to retrieve.
   * @returns The found answer or null if not found.
   */
  findOne(id: string) {
    return this.prisma.answers.findUnique({ where: { id } });
  }

  /**
   * Updates an existing answer.
   * @param id The ID of the answer to update.
   * @param updateAnswerDto The data to update the answer with.
   * @returns The updated answer.
   */
  update(id: string, updateAnswerDto: UpdateAnswerDto) {
    return this.prisma.answers.update({ where: { id }, data: updateAnswerDto });
  }

  /**
   * Soft-deletes an answer by setting its `deletedAt` timestamp.
   * @param id The ID of the answer to soft-delete.
   * @returns The answer with the updated `deletedAt` field.
   */
  remove(id: string) {
    return this.prisma.answers.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}