import { Router } from 'express';
import { generateCitizenshipCard } from '../commands/core/citizenship';
// import prisma from '../database';

const apiRouter = Router();

apiRouter.get('/', (_req, res) => {
	res.status(200).json({ success: true });
});

// apiRouter.get('/citizencard', async (req, res) => {
// 	const { discordId } = req.query;
// 	if (!discordId) return res.status(400).send(400);
// 	let citizenship = await prisma.user.findUnique({ where: { discordId: discordId as string } });
// 	if (!citizenship) return res.status(404).send(404);
// 	let card = await generateCitizenshipCard(citizenship);
// 	if (!card) return res.status(500).send(500);
// 	return res.status(200).setHeader('content-type', 'image/png').send(card);
// });
export default apiRouter;
