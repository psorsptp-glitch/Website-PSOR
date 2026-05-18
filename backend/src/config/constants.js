export const ROLES = {
  ADMIN:  'admin',
  VIEWER: 'viewer'
}

export const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d'

export const PAGINATION = {
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT:     100
}
