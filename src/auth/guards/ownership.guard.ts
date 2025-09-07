import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resource = this.reflector.get<string>(
      'resource',
      context.getHandler(),
    );
    if (!resource) return true;

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub;
    const resourceId = request.params.id;

    if (!userId || !resourceId) return false;

    const entity = await this.prisma[resource].findUnique({
      where: { id: resourceId },
    });

    if (!entity) {
      throw new NotFoundException(`Resource not found.`);
    }

    if (entity.userId !== userId) {
      throw new ForbiddenException('You do not own this resource.');
    }

    return true;
  }
}
