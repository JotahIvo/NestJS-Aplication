import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createQuestionDto: CreateQuestionDto, @User() user: { sub: string }) {
    return this.questionsService.create(createQuestionDto, user.sub);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: 400, optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ errorHttpStatusCode: 400, optional: true })) pageSize = 20,
  ) {
    return this.questionsService.findAll({ page, pageSize });
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
    @User() user: { sub: string },
  ) {
    return this.questionsService.update(id, updateQuestionDto, user.sub);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: { sub: string }) {
    return this.questionsService.remove(id, user.sub);
  }

  @UseGuards(AuthGuard)
  @Get('details/all')
  findAllWithDetails() {
    return this.questionsService.findAllWithAuthorDetails();
  }

  @UseGuards(AuthGuard)
  @Get('search/by-title')
  search(@Query('term') term: string) {
    return this.questionsService.searchByTitle(term);
  }
}
