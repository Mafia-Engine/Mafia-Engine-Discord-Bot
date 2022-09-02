import { Router } from 'express';

const apiRouter = Router();

apiRouter.get('/', (_req, res) => {
	res.status(200).json({ success: true });
});

export default apiRouter;
