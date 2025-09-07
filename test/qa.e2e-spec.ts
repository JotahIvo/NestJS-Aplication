import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Q&A Flow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    // Clean up database before tests
    await prisma.answers.deleteMany();
    await prisma.questions.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should allow a user to sign up, log in, post a question, and post an answer', async () => {
    const userCredentials = {
      email: `test-user-${Date.now()}@example.com`,
      name: 'Test User',
      password: 'password123',
    };

    // 1. Sign up a new user
    await request(app.getHttpServer())
      .post('/user')
      .send(userCredentials)
      .expect(201);

    // 2. Log in to get an access token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email: userCredentials.email, password: userCredentials.password })
      .expect(200);

    const accessToken = loginResponse.body.access_token;
    expect(accessToken).toBeDefined();

    // 3. Post a question using the token
    const questionResponse = await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'My First Question', body: 'How does e2e testing work?' })
      .expect(201);

    const questionId = questionResponse.body.id;
    expect(questionId).toBeDefined();
    expect(questionResponse.body.title).toBe('My First Question');

    // 4. Post an answer to that question
    const answerResponse = await request(app.getHttpServer())
      .post(`/answers/${questionId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ body: 'It works like this!' })
      .expect(201);

    expect(answerResponse.body.body).toBe('It works like this!');
    expect(answerResponse.body.questionId).toBe(questionId);
  });
});