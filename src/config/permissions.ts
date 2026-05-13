import { UserRole } from '@/types/user';

// Define all available features in the system
export type Feature =
  | 'members'
  | 'users'
  | 'registration-requests'
  | 'prayer-requests'
  | 'schedules'
  | 'songs'
  | 'attendance'
  | 'contributions';

// Define all possible actions
export type Action =
  | 'list'
  | 'create'
  | 'edit'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'upload-photo'
  | 'change-password'
  | 'mark-as-read'
  | 'register';

// Define permissions structure
export type Permission = {
  feature: Feature;
  actions: Action[];
};

// Role-based permissions configuration
export const rolePermissions: Record<UserRole, Permission[]> = {
  // Admin - Full access to all features
  admin: [
    { feature: 'members', actions: ['list', 'create', 'edit', 'delete', 'upload-photo'] },
    { feature: 'users', actions: ['list', 'create', 'edit', 'delete', 'change-password'] },
    { feature: 'registration-requests', actions: ['list', 'create', 'edit', 'delete', 'approve', 'reject'] },
    { feature: 'prayer-requests', actions: ['list', 'delete', 'mark-as-read'] },
    { feature: 'schedules', actions: ['list', 'create', 'edit', 'delete'] },
    { feature: 'songs', actions: ['list', 'create', 'edit', 'delete'] },
    { feature: 'attendance', actions: ['list', 'register'] },
    { feature: 'contributions', actions: ['list', 'create', 'edit', 'delete'] },
  ],

  // Admin2 - Broad access without delete
  admin2: [
    { feature: 'members', actions: ['list', 'create', 'edit', 'upload-photo'] },
    { feature: 'users', actions: ['list', 'edit', 'change-password'] },
    { feature: 'registration-requests', actions: ['list', 'approve', 'reject', 'edit'] },
    { feature: 'prayer-requests', actions: ['list', 'mark-as-read'] },
    { feature: 'schedules', actions: ['list', 'create', 'edit'] },
    { feature: 'songs', actions: ['list', 'create', 'edit'] },
    { feature: 'attendance', actions: ['list', 'register'] },
  ],

  // Secretary - General church administration
  secretary: [
    { feature: 'members', actions: ['list', 'create', 'edit', 'upload-photo'] },
    { feature: 'users', actions: ['list', 'edit', 'change-password'] },
    { feature: 'registration-requests', actions: ['list', 'approve', 'reject', 'edit'] },
    { feature: 'prayer-requests', actions: ['list', 'mark-as-read'] },
    { feature: 'schedules', actions: ['list', 'create', 'edit'] },
    { feature: 'songs', actions: ['list', 'create', 'edit'] },
    { feature: 'attendance', actions: ['list', 'register'] },
  ],

  // Treasurer - Financial access and reports
  treasurer: [
    { feature: 'members', actions: ['list'] },
    { feature: 'attendance', actions: ['list'] },
    { feature: 'contributions', actions: ['list', 'create', 'edit', 'delete'] },
  ],

  // Receptionist - Front desk, attendance, and first screening
  receptionist: [
    { feature: 'members', actions: ['list', 'create', 'edit', 'upload-photo'] },
    { feature: 'registration-requests', actions: ['list', 'approve', 'reject'] },
    { feature: 'attendance', actions: ['list', 'register'] },
  ],

  // Leader - Ministry leader (schedules, worship, attendance)
  leader: [
    { feature: 'members', actions: ['list', 'create', 'edit', 'upload-photo'] },
    { feature: 'schedules', actions: ['list', 'create', 'edit'] },
    { feature: 'songs', actions: ['list', 'create', 'edit'] },
    { feature: 'attendance', actions: ['list', 'register'] },
  ],

  // Member - Basic access (own profile view)
  member: [],
};

// Helper function to check if a user has permission for a specific feature and action
export const hasPermission = (
  userRole: UserRole,
  feature: Feature,
  action?: Action
): boolean => {
  const permissions = rolePermissions[userRole];
  const featurePermission = permissions.find((p) => p.feature === feature);

  if (!featurePermission) {
    return false;
  }

  if (!action) {
    // If no specific action is provided, check if the feature exists
    return true;
  }

  return featurePermission.actions.includes(action);
};

// Helper function to check if a user can access a feature (any action)
export const canAccessFeature = (userRole: UserRole, feature: Feature): boolean => {
  return hasPermission(userRole, feature);
};
