import { Router } from 'express'
import { getAllUsers, updateUserRole, updateProfile } from '../controllers/users.controller.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

router.get  ('/',             requireAdmin, getAllUsers)
router.patch('/me',           updateProfile)
router.patch('/:id/role',     requireAdmin, updateUserRole)

export default router
