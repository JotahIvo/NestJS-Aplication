import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @UseGuards(AuthGuard)
  @Post(':questionId')
  create(
    @Body() createAnswerDto: CreateAnswerDto,
    @User() user: { sub: string },
    @Param('questionId') questionId: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.answersService.create(createAnswerDto, user.sub, questionId);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: 400, optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ errorHttpStatusCode: 400, optional: true })) pageSize = 20,
  ) {
    return this.answersService.findAll({ page, pageSize });
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.answersService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAnswerDto: UpdateAnswerDto) {
    return this.answersService.update(id, updateAnswerDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.answersService.remove(id);
  }
}
