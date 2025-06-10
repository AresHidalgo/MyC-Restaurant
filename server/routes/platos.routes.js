import { Router } from 'express';
import {
  getPlatos,
  getPlatoById,
  createPlato,
  updatePlato,
  deletePlato,
  toggleDisponibilidad,
  searchPlatos
} from '../controllers/platos.controller.js';

const router = Router();

router.get('/', getPlatos);
router.get('/search', searchPlatos);
router.get('/:id', getPlatoById);
router.post('/', createPlato);
router.put('/:id', updatePlato);
router.delete('/:id', deletePlato);
router.patch('/:id/disponibilidad', toggleDisponibilidad);

export default router;