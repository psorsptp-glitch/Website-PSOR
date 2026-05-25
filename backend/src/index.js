import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import routes from './routes/index.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import { logger } from './utils/logger.js'

const app  = express()
const PORT = process.env.PORT || 3000

// ── Security ──────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://portapeople.netlify.app/'],
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS']
}))

// ── Rate limiting ─────────────────────────────────────
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { success: false, message: 'Terlalu banyak request, coba lagi 15 menit lagi.' }
}))
app.use('/api', rateLimit({
  windowMs: 60 * 1000,
  max: 200
}))

// ── Body parsing ──────────────────────────────────────
app.use(compression())
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Logging ───────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

// ── Routes ────────────────────────────────────────────
app.use('/api', routes)

// ── Error handling ────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

// ── Start ─────────────────────────────────────────────
app.listen(PORT, () => {
  logger.success(`🚢 Pelindo OrgChart API running on port ${PORT}`)
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
  logger.info(`Health: http://localhost:${PORT}/api/health`)
})

export default app
