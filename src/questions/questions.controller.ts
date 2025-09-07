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
  SetMetadata,
  UseInterceptors, 
  Inject,        
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import { OwnershipGuard } from 'src/auth/guards/ownership.guard';
import { CacheInterceptor, CACHE_MANAGER } from '@nestjs/cache-manager'; 
import { Cache } from 'cache-manager';
import { FeatureGuard } from 'src/features/feature.guard';

@Controller('questions')
export class QuestionsController {
  constructor(
    private readonly questionsService: QuestionsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createQuestionDto: CreateQuestionDto, @User() user: { sub: string }) {
    return this.questionsService.create(createQuestionDto, user.sub);
  }

  @UseInterceptors(CacheInterceptor)
  @Get()
  findAll(
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: 400, optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ errorHttpStatusCode: 400, optional: true })) pageSize = 20,
  ) {
    return this.questionsService.findAll({ page, pageSize });
  }

  @UseInterceptors(CacheInterceptor)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  @UseGuards(AuthGuard, OwnershipGuard)
  @SetMetadata('resource', 'questions')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    const requestUrl = `/questions/${id}`;
    await this.cacheManager.del(requestUrl); 
    return this.questionsService.update(id, updateQuestionDto);
  }

  @UseGuards(AuthGuard, OwnershipGuard)
  @SetMetadata('resource', 'questions')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const requestUrl = `/questions/${id}`;
    await this.cacheManager.del(requestUrl); 
    return this.questionsService.remove(id);
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

  @Get('search/advanced')
  @UseGuards(FeatureGuard)
  @SetMetadata('feature_key', 'isAdvancedSearchEnabled')
  advancedSearch(@Query('q') query: string) {
    return {
      message: 'Advanced search feature is active',
      query,
    };
  }
}
