import fs from 'fs';

export const SVG: Record<string, string> = {};
export async function loadSVGFiles(path: string) {
	try {
		let files = fs.readdirSync(path);
		for (const file of files) {
			let fileData = fs.readFileSync(`${path}/${file}`).toString();
			SVG[file.split('.')[0]] = fileData;
		}
		return true;
	} catch (err) {
		console.log(err);
		return false;
	}
}

interface CitizenshipCardProps {
	username: string;
	title: string;
	avatar: string;
}
export function citizenshipCard({ username, title, avatar }: CitizenshipCardProps) {
	let citizenshipCard = SVG['citizencard'];
	if (!citizenshipCard) return null;

	citizenshipCard = citizenshipCard.replace(/{{username}}/g, username);
	citizenshipCard = citizenshipCard.replace(/{{title}}/g, title);
	citizenshipCard = citizenshipCard.replace(/{{avatarUrl}}/g, avatar);

	return citizenshipCard;
}
