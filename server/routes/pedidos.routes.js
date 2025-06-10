import { Router } from 'express';
import {
  getPedidos,
  getPedidoById,
  createPedido,
  updatePedidoStatus,
  getClientePedidos
} from '../controllers/pedidos.controller.js';

const router = Router();

router.get('/', getPedidos);
router.get('/:id', getPedidoById);
router.get('/cliente/:id', getClientePedidos);
router.post('/', createPedido);
router.patch('/:id/estado', updatePedidoStatus);

export default router;