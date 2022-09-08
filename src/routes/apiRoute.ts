import { Router } from 'express';
import convert from 'convert-svg-to-png';
import { svg2png } from 'svg-png-converter';

import sharp from 'sharp';

const apiRouter = Router();

apiRouter.get('/', (_req, res) => {
	res.status(200).json({ success: true });
});

apiRouter.get('/convert', async (req, res) => {});

export default apiRouter;
