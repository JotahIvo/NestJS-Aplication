import { User as Users } from 'generated/prisma';

export class User implements Users {
  name: string;
  id: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
