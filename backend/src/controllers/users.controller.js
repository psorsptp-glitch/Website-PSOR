import { supabase } from '../config/supabase.js'
import { sendSuccess, sendError } from '../utils/response.js'
import bcrypt from 'bcryptjs'

// GET /api/users — admin only
export const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, is_active, created_at, last_login_at')
      .order('created_at', { ascending: false })
    if (error) throw error
    return sendSuccess(res, data)
  } catch (err) {
    return sendError(res, err.message)
  }
}

// PATCH /api/users/:id/role — change role
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body
    if (!['admin', 'viewer'].includes(role))
      return sendError(res, 'Role tidak valid', 400)

    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', req.params.id)
      .select('id, name, email, role')
      .single()

    if (error) throw error
    return sendSuccess(res, data, 'Role berhasil diperbarui')
  } catch (err) {
    return sendError(res, err.message)
  }
}

// PATCH /api/users/me — update own profile
export const updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body
    const updates = {}
    if (name) updates.name = name
    if (password) updates.password_hash = await bcrypt.hash(password, 12)

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, name, email, role')
      .single()

    if (error) throw error
    return sendSuccess(res, data, 'Profile berhasil diperbarui')
  } catch (err) {
    return sendError(res, err.message)
  }
}
