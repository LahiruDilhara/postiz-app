import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  AbilityPolicy,
  CHECK_POLICIES_KEY,
} from '@gitroom/backend/services/auth/permissions/permissions.ability';
import { Request } from 'express';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(private _reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    if (
      request.path.indexOf('/auth') > -1 ||
      request.path.indexOf('/integrations/social-connect') > -1 ||
      request.path.indexOf('/integrations/provider') > -1
    ) {
      return true;
    }

    const policyHandlers =
      this._reflector.get<AbilityPolicy[]>(
        CHECK_POLICIES_KEY,
        context.getHandler()
      ) || [];

    if (!policyHandlers?.length) {
      return true;
    }

    // No subscription / plan enforcement: policy metadata is ignored.
    return true;
  }
}
