import { Router } from 'express';
import {
  getResenas,
  getResenaById,
  createResena,
  updateResena,
  deleteResena,
  getResenasFiltradas,
  searchResenas,
  getClienteResenas,
  getResenaStats
} from '../controllers/resenas.controller.js';

const router = Router();

router.get('/', getResenas);
router.get('/filtrar', getResenasFiltradas);
router.get('/buscar', searchResenas);
router.get('/stats', getResenaStats);
router.get('/cliente/:id', getClienteResenas);
router.get('/:id', getResenaById);
router.post('/', createResena);
router.put('/:id', updateResena);
router.delete('/:id', deleteResena);

export default router;