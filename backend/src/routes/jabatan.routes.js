import { Router } from 'express'
import {
  getAllJabatan, getJabatanTree, getJabatanById,
  createJabatan, updateJabatan, updateJabatanGambar, deleteJabatan,
  moveJabatan, getDivisions, getOrganizations, getJabatanByOrganization
} from '../controllers/jabatan.controller.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createJabatanSchema, updateJabatanSchema } from '../validators/jabatan.validator.js'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Read — both admin & viewer
router.get ('/',                      getAllJabatan)
router.get ('/tree',                  getJabatanTree)
router.get ('/divisions',             getDivisions)
router.get ('/organizations',         getOrganizations)
router.get ('/by-organization/:org',  getJabatanByOrganization)
router.get ('/:id',                   getJabatanById)

// Write — admin only
router.post  ('/',          requireAdmin, validate(createJabatanSchema), createJabatan)
router.put   ('/:id',       requireAdmin, validate(updateJabatanSchema), updateJabatan)
router.patch ('/:id/gambar', requireAdmin, updateJabatanGambar)
router.delete('/:id',       requireAdmin, deleteJabatan)
router.patch ('/:id/move',  requireAdmin, moveJabatan)

export default router
