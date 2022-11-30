import { prisma } from '..';

export const interactionError = async (errorMessage: any) => {
	try {
		const err = errorMessage as string;
		const dbEntry = await prisma.error.create({
			data: {
				errorMessage: err,
			},
		});
		return dbEntry.errorCode;
	} catch (error) {
		console.log('Unable to create an Error entry. BIG ISSUE');
		return null;
	}
};
