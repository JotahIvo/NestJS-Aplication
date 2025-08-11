import { Answers } from '@prisma/client';
import { Question } from 'src/questions/entities/question.entity';
import { User } from 'src/user/entities/user.entity';

export class Answer implements Answers {
  id: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  questionId: string;
  user: User;
  question: Question;
}
