import { Router } from 'express';
const apiRouter = Router();

apiRouter.get('/card', (req, res) => {
	const username = 'Melancholic';
	res.status(200).json({ success: true });
});

export default apiRouter;
