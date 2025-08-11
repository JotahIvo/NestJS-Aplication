import { Questions } from 'generated/prisma';
import { User } from 'src/user/entities/user.entity';

export class Question implements Questions {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: User;
}
