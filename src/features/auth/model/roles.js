export const ROLES = { BUYER: 'BUYER', SELLER: 'SELLER', ADMIN: 'ADMIN' };

// Where each role lands after signing in. Add routes here as new modules appear.
const HOME = { BUYER: '/', SELLER: '/seller', ADMIN: '/admin' };
export const homeFor = (role) => HOME[role] ?? '/login';
