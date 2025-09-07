import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DatabaseModule } from 'src/database/database.module';
import { UserRepository } from './user.repository';
import { UserStatsQueryHandler } from './queries/user-stats.query';

@Module({
  imports: [DatabaseModule], // A importação do AuthModule foi removida daqui
  controllers: [UserController],
  providers: [UserService, UserRepository, UserStatsQueryHandler],
  exports: [UserService], // Exportamos UserService para o AuthModule usar
})
export class UserModule {}
