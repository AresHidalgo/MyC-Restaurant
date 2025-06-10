import { Router } from 'express';
import {
  getClientePreferencias,
  upsertClientePreferencias,
  getClientesConPreferencias,
  deleteClientePreferencias
} from '../controllers/preferencias.controller.js';

const router = Router();

router.get('/', getClientesConPreferencias);
router.get('/cliente/:id', getClientePreferencias);
router.post('/cliente/:id', upsertClientePreferencias);
router.put('/cliente/:id', upsertClientePreferencias);
router.delete('/cliente/:id', deleteClientePreferencias);

export default router;