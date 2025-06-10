import { Router } from 'express';
import {
  getHistorialCliente,
  getHistorialPedidoById,
  updateHistorialPedido,
  getMasOrdenadosPorCliente,
  getEstadisticasPlatoGlobal
} from '../controllers/historial.controller.js';

const router = Router();

router.get('/cliente/:id', getHistorialCliente);
router.get('/pedido/:id', getHistorialPedidoById);
router.get('/cliente/:id/populares', getMasOrdenadosPorCliente);
router.get('/estadisticas/platos', getEstadisticasPlatoGlobal);
router.put('/pedido/:id', updateHistorialPedido);

export default router;