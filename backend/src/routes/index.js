import { Router } from 'express'
import authRoutes    from './auth.routes.js'
import jabatanRoutes from './jabatan.routes.js'
import usersRoutes   from './users.routes.js'
import swpRoutes    from './swp.routes.js'
const router = Router()

router.use('/auth',    authRoutes)
router.use('/jabatan', jabatanRoutes)
router.use('/users',   usersRoutes)
router.use('/swp',     swpRoutes)

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime(), timestamp: new Date().toISOString() })
})

export default router
