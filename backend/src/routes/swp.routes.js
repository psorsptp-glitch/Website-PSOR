import { Router } from 'express'
import * as ctrl from '../controllers/swp.controller.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Terminal
router.get('/terminals', ctrl.getTerminals)

// Fetch All
router.get('/all', ctrl.fetchAll)

// Kinerja
router.get('/kinerja', ctrl.getKinerja)
router.post('/kinerja', ctrl.createKinerja)
router.put('/kinerja/:id', ctrl.updateKinerja)
router.patch('/kinerja/:id/period', ctrl.updateKinerjaPeriod)
router.delete('/kinerja/:id', ctrl.deleteKinerja)

// Fasilitas
router.get('/fasilitas', ctrl.getFasilitas)
router.post('/fasilitas', ctrl.createFasilitas)
router.put('/fasilitas/:id', ctrl.updateFasilitas)
router.delete('/fasilitas/:id', ctrl.deleteFasilitas)

// Shift
router.get('/shift', ctrl.getShift)
router.post('/shift', ctrl.createShift)
router.put('/shift/:id', ctrl.updateShift)
router.delete('/shift/:id', ctrl.deleteShift)

// SDM
router.get('/sdm', ctrl.getSDM)
router.post('/sdm', ctrl.createSDM)
router.put('/sdm/:id', ctrl.updateSDM)
router.delete('/sdm/:id', ctrl.deleteSDM)

// Status Pekerja
router.get('/status', ctrl.getStatus)
router.post('/status', ctrl.createStatus)
router.put('/status/:id', ctrl.updateStatus)
router.delete('/status/:id', ctrl.deleteStatus)

export default router