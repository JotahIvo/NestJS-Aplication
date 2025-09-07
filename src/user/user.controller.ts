import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'generated/prisma';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { GetUserStatsDto } from './dtos/getUserStats.dto';
import { UserStatsQueryHandler } from './queries/user-stats.query';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private userStatsQueryHandler: UserStatsQueryHandler,
  ) {}

  @Post()
  async signupUser(@Body() userData: CreateUserDto): Promise<User> {
    return this.userService.createUser(userData);
  }

  @Get(':id')
  async getUser(
    @Param('id') id: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.userService.user({ id: id });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return user;
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async updateuser(
    @Body() userData: UpdateUserDto,
    @Param('id') id: string,
  ): Promise<User> {
    return this.userService.updateUser({
      where: { id: id },
      data: userData,
    });
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<User> {
    return this.userService.deleteUser({ id: id });
  }

  @Post('stats')
  async getUserStats(@Body() options: GetUserStats-Dto) {
    return this.userStatsQueryHandler.execute(options); // Chame o handler
  }

  @Get('search/raw')
  async searchUser(@Query('name') name: string) {
    return this.userService.searchUsersRaw(name);
  }
}
