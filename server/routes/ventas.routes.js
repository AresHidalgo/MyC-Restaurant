import { Router } from 'express';
import {
  getVentasData
} from '../controllers/ventas.controller.js';

const router = Router();

router.get('/', getVentasData);

export default router;
