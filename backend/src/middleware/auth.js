import jwt from 'jsonwebtoken'
import { supabase } from '../config/supabase.js'
import { sendError } from '../utils/response.js'
import { ROLES } from '../config/constants.js'

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return sendError(res, 'Token tidak ditemukan', 401)
    }
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Fetch user from DB to ensure still exists & get latest role
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, is_active')
      .eq('id', decoded.sub)
      .single()

    if (error || !user) return sendError(res, 'User tidak ditemukan', 401)
    if (!user.is_active) return sendError(res, 'Akun tidak aktif', 403)

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') return sendError(res, 'Token kadaluarsa', 401)
    if (err.name === 'JsonWebTokenError') return sendError(res, 'Token tidak valid', 401)
    return sendError(res, 'Authentication error', 500)
  }
}

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== ROLES.ADMIN) {
    return sendError(res, 'Akses ditolak. Hanya admin yang diizinkan.', 403)
  }
  next()
}

export const requireAdminOrViewer = (req, res, next) => {
  if (![ROLES.ADMIN, ROLES.VIEWER].includes(req.user?.role)) {
    return sendError(res, 'Akses ditolak.', 403)
  }
  next()
}
