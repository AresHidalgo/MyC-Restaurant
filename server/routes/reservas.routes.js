import { Router } from 'express';
import {
  getReservas,
  getReservaById,
  createReserva,
  updateReserva,
  deleteReserva,
  changeReservaStatus,
  getReservasByDate
} from '../controllers/reservas.controller.js';

const router = Router();

router.get('/', getReservas);
router.get('/fecha/:fecha', getReservasByDate);
router.get('/:id', getReservaById);
router.post('/', createReserva);
router.put('/:id', updateReserva);
router.delete('/:id', deleteReserva);
router.patch('/:id/estado', changeReservaStatus);

export default router;