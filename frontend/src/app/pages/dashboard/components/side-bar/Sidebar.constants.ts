export const SIDEBAR_ROUTES = {
  employeeDashboard: '/employee-dashboard',
  adminDashboard: '/admin-dashboard',
  guestDashboard: '/guest-dashboard',
  login: '/login',
} as const;

export const QUERY_PARAMS = {
  catId: 'catId',
  mine: 'mine',
  view: 'view',
} as const;

export const USER_ROLES = {
  admin: 'ADMIN',
  employee: 'EMPLOYEE',
  guest: 'GUEST',
} as const;
