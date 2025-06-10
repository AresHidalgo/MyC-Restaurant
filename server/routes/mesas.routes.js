import { Router } from 'express';
import {
  getMesas,
  getMesaById,
  createMesa,
  updateMesa,
  deleteMesa,
  checkMesaAvailability
} from '../controllers/mesas.controller.js';

const router = Router();

router.get('/', getMesas);
router.get('/disponibilidad', checkMesaAvailability);
router.get('/:id', getMesaById);
router.post('/', createMesa);
router.put('/:id', updateMesa);
router.delete('/:id', deleteMesa);

export default router;