import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { supabase } from '../config/supabase.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { JWT_EXPIRES } from '../config/constants.js'

const signToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES })

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'viewer' } = req.body
    if (!name || !email || !password)
      return sendError(res, 'name, email, password wajib diisi', 400)

    // Check duplicate
    const { data: existing } = await supabase
      .from('users').select('id').eq('email', email).single()
    if (existing) return sendError(res, 'Email sudah terdaftar', 409)

    const hashed = await bcrypt.hash(password, 12)
    const { data: user, error } = await supabase
      .from('users')
      .insert({ name, email, password_hash: hashed, role, is_active: true })
      .select('id, name, email, role')
      .single()

    if (error) throw error

    const token = signToken(user.id)
    return sendSuccess(res, { token, user }, 'Registrasi berhasil', 201)
  } catch (err) {
    return sendError(res, err.message)
  }
}

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return sendError(res, 'Email dan password wajib diisi', 400)

    const { data: user } = await supabase
      .from('users')
      .select('id, name, email, role, password_hash, is_active')
      .eq('email', email)
      .single()

    if (!user) return sendError(res, 'Email atau password salah', 401)
    if (!user.is_active) return sendError(res, 'Akun tidak aktif', 403)

    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) return sendError(res, 'Email atau password salah', 401)

    // Update last login
    await supabase.from('users').update({ last_login_at: new Date().toISOString() }).eq('id', user.id)

    const token = signToken(user.id)
    const { password_hash, ...safeUser } = user
    return sendSuccess(res, { token, user: safeUser }, 'Login berhasil')
  } catch (err) {
    return sendError(res, err.message)
  }
}

// GET /api/auth/me
export const getMe = async (req, res) => {
  return sendSuccess(res, req.user, 'Profile berhasil diambil')
}

// POST /api/auth/logout (stateless JWT — client deletes token)
export const logout = async (req, res) => {
  return sendSuccess(res, null, 'Logout berhasil')
}
