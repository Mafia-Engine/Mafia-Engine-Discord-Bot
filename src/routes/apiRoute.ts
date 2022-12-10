import { Router } from 'express';
import { prisma } from '..';
// import { generateCitizenshipCard } from '../commands/core/citizenship';
// import prisma from '../database';

const apiRouter = Router();

apiRouter.get('/', (_req, res) => {
	res.status(200).json({ success: true });
});

apiRouter.get('/archive/:channelId', async (req, res) => {
	const { channelId } = req.params;
	const query = req.query;

	let mpp = query.mpp ? parseInt(query.mpp as string) : 25;
	let start = query.start ? parseInt(query.start as string) : 0;

	const queryResults = await prisma.archivedMessage.findMany({
		where: {
			channel: {
				discordChannelId: channelId,
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
		take: mpp,
		skip: start,
	});

	res.status(200).json(queryResults);
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
