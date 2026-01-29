/**
 * Role-Based Access Control (RBAC) Guard
 * 
 * Implements "Least Privilege" access - users only see what they need.
 * Caregivers see only their assigned clients, not the full database.
 * 
 * HIPAA Technical Safeguard: Access Control (§164.312(a)(1))
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * User roles in the system
 */
export enum UserRole {
  ADMIN = 'admin',           // Full system access
  OFFICE_MANAGER = 'office_manager', // Manage staff and clients
  SCHEDULER = 'scheduler',   // Schedule assignments
  CAREGIVER = 'caregiver',   // View assigned clients only
  CLIENT = 'client',         // View own records only
  FAMILY = 'family',         // View family member's records
}

/**
 * Permission types for granular access control
 */
export enum Permission {
  // Client permissions
  CLIENT_CREATE = 'client:create',
  CLIENT_READ = 'client:read',
  CLIENT_READ_ALL = 'client:read:all',
  CLIENT_READ_ASSIGNED = 'client:read:assigned',
  CLIENT_UPDATE = 'client:update',
  CLIENT_DELETE = 'client:delete',
  
  // Caregiver permissions
  CAREGIVER_CREATE = 'caregiver:create',
  CAREGIVER_READ = 'caregiver:read',
  CAREGIVER_UPDATE = 'caregiver:update',
  CAREGIVER_DELETE = 'caregiver:delete',
  
  // Schedule permissions
  SCHEDULE_CREATE = 'schedule:create',
  SCHEDULE_READ = 'schedule:read',
  SCHEDULE_UPDATE = 'schedule:update',
  SCHEDULE_DELETE = 'schedule:delete',
  
  // PHI-specific permissions
  PHI_VIEW_SSN = 'phi:view:ssn',
  PHI_VIEW_MEDICAL = 'phi:view:medical',
  PHI_EXPORT = 'phi:export',
  
  // Admin permissions
  USER_MANAGE = 'user:manage',
  AUDIT_VIEW = 'audit:view',
  SETTINGS_MANAGE = 'settings:manage',
}

/**
 * Role-Permission mapping
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: Object.values(Permission), // All permissions
  
  [UserRole.OFFICE_MANAGER]: [
    Permission.CLIENT_CREATE,
    Permission.CLIENT_READ_ALL,
    Permission.CLIENT_UPDATE,
    Permission.CAREGIVER_CREATE,
    Permission.CAREGIVER_READ,
    Permission.CAREGIVER_UPDATE,
    Permission.SCHEDULE_CREATE,
    Permission.SCHEDULE_READ,
    Permission.SCHEDULE_UPDATE,
    Permission.PHI_VIEW_SSN,
    Permission.PHI_VIEW_MEDICAL,
  ],
  
  [UserRole.SCHEDULER]: [
    Permission.CLIENT_READ_ALL,
    Permission.CAREGIVER_READ,
    Permission.SCHEDULE_CREATE,
    Permission.SCHEDULE_READ,
    Permission.SCHEDULE_UPDATE,
  ],
  
  [UserRole.CAREGIVER]: [
    Permission.CLIENT_READ_ASSIGNED, // Only assigned clients
    Permission.SCHEDULE_READ,
    Permission.PHI_VIEW_MEDICAL, // Need medical info for care
  ],
  
  [UserRole.CLIENT]: [
    // Clients handled separately - can only view own records
  ],
  
  [UserRole.FAMILY]: [
    // Family handled separately - can only view family member's records
  ],
};

// Decorator keys
export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to require specific roles
 * 
 * @example
 * @Roles(UserRole.ADMIN, UserRole.OFFICE_MANAGER)
 * @Get('clients')
 * async getAllClients() { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Decorator to require specific permissions
 * 
 * @example
 * @RequirePermissions(Permission.PHI_VIEW_SSN)
 * @Get('clients/:id/ssn')
 * async getClientSSN() { ... }
 */
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * RBAC Guard Implementation
 */
@Injectable()
export class RBACGuard implements CanActivate {
  private readonly logger = new Logger(RBACGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles and permissions from decorators
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no requirements, allow access
    if (!requiredRoles?.length && !requiredPermissions?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logAccessDenied(request, 'No user in request');
      throw new ForbiddenException('Authentication required');
    }

    // Check roles
    if (requiredRoles?.length) {
      const hasRole = requiredRoles.some(role => user.role === role);
      
      if (!hasRole) {
        this.logAccessDenied(request, `Required roles: ${requiredRoles.join(', ')}`);
        throw new ForbiddenException('Insufficient role permissions');
      }
    }

    // Check permissions
    if (requiredPermissions?.length) {
      const userPermissions = this.getUserPermissions(user);
      const hasAllPermissions = requiredPermissions.every(
        permission => userPermissions.includes(permission),
      );

      if (!hasAllPermissions) {
        this.logAccessDenied(
          request,
          `Required permissions: ${requiredPermissions.join(', ')}`,
        );
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    return true;
  }

  private getUserPermissions(user: any): Permission[] {
    const rolePermissions = ROLE_PERMISSIONS[user.role as UserRole] || [];
    const customPermissions = user.permissions || [];
    
    return [...new Set([...rolePermissions, ...customPermissions])];
  }

  private logAccessDenied(request: any, reason: string): void {
    this.logger.warn({
      event: 'access_denied',
      userId: request.user?.id,
      userRole: request.user?.role,
      endpoint: request.url,
      method: request.method,
      reason,
      ip: request.ip,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Resource Ownership Guard
 * 
 * Ensures users can only access resources they own or are assigned to.
 * This implements HIPAA's minimum necessary standard.
 */
@Injectable()
export class ResourceOwnershipGuard implements CanActivate {
  private readonly logger = new Logger(ResourceOwnershipGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Admins and office managers can access all resources
    if ([UserRole.ADMIN, UserRole.OFFICE_MANAGER].includes(user.role)) {
      return true;
    }

    const resourceId = request.params.id || request.params.clientId;
    
    if (!resourceId) {
      return true; // No specific resource requested
    }

    // Check based on role
    switch (user.role) {
      case UserRole.CAREGIVER:
        return this.canCaregiverAccess(user, resourceId, request);
      
      case UserRole.CLIENT:
        return this.canClientAccess(user, resourceId);
      
      case UserRole.FAMILY:
        return this.canFamilyAccess(user, resourceId);
      
      default:
        return false;
    }
  }

  private async canCaregiverAccess(
    user: any,
    clientId: string,
    request: any,
  ): Promise<boolean> {
    // Check if caregiver is assigned to this client
    // This would typically query your database
    const isAssigned = user.assignedClientIds?.includes(clientId);
    
    if (!isAssigned) {
      this.logger.warn({
        event: 'unauthorized_client_access_attempt',
        caregiverId: user.id,
        attemptedClientId: clientId,
        endpoint: request.url,
        timestamp: new Date().toISOString(),
      });
    }
    
    return isAssigned;
  }

  private async canClientAccess(user: any, resourceId: string): Promise<boolean> {
    // Clients can only access their own records
    return user.clientId === resourceId;
  }

  private async canFamilyAccess(user: any, resourceId: string): Promise<boolean> {
    // Family members can only access authorized family member records
    return user.authorizedClientIds?.includes(resourceId);
  }
}

/**
 * Example Controller Usage
 */
export const exampleControllerUsage = `
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RBACGuard, ResourceOwnershipGuard } from './rbac.guard';
import { Roles, RequirePermissions, UserRole, Permission } from './rbac.guard';

@Controller('clients')
@UseGuards(JwtAuthGuard, RBACGuard, ResourceOwnershipGuard)
export class ClientsController {
  
  // Only admins and office managers can see all clients
  @Get()
  @Roles(UserRole.ADMIN, UserRole.OFFICE_MANAGER)
  @RequirePermissions(Permission.CLIENT_READ_ALL)
  async getAllClients() {
    // Returns all clients
  }
  
  // Caregivers can access their assigned clients
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.OFFICE_MANAGER, UserRole.CAREGIVER)
  @RequirePermissions(Permission.CLIENT_READ_ASSIGNED)
  async getClient(@Param('id') id: string) {
    // ResourceOwnershipGuard ensures caregivers only see assigned clients
  }
  
  // Only specific roles can view SSN
  @Get(':id/ssn')
  @Roles(UserRole.ADMIN, UserRole.OFFICE_MANAGER)
  @RequirePermissions(Permission.PHI_VIEW_SSN)
  async getClientSSN(@Param('id') id: string) {
    // Highly sensitive - very restricted access
  }
}
`;
