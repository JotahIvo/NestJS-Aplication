import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FEATURES } from 'src/config/features';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const featureKey = this.reflector.get<keyof typeof FEATURES>(
      'feature_key',
      context.getHandler(),
    );

    if (!featureKey) {
      return true; // Se nenhuma feature for especificada, a rota é pública
    }

    const isEnabled = FEATURES[featureKey];

    if (isEnabled) {
      return true;
    }

    // Se a feature não estiver habilitada, retorne 404 para que o endpoint pareça não existir.
    throw new NotFoundException('Cannot find the requested resource');
  }
}
