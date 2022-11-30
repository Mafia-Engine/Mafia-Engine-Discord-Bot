import { ButtonInteraction, DataManager } from 'discord.js';
import fs from 'fs';
import path from 'path';

type ButtonCallHandle = string;
type ButtonData = string;
type ButtonHandle = {
	handle: ButtonCallHandle;
	data?: ButtonData;
};
type ButtonClickEvent = (i: ButtonInteraction, data?: string) => any | Promise<any>;

export function createButtonHandle(wholeHandle: string): ButtonHandle {
	const split = wholeHandle.split(':');
	const handle = split.shift();
	const data = split.length > 0 ? split.join(':') : undefined;
	return { handle, data };
}

export default class Button {
	public static buttons: Record<ButtonCallHandle, Button> = {};
	public static async loadButtons(dirPath: string) {
		const result = fs.readdirSync(dirPath);
		if (!result) throw Error('Unable to load slash commands.');
		for (let i = 0; i < result.length; i++) {
			await require(path.join(dirPath, result[i]));
		}
	}

	private handle: ButtonHandle;
	public onClickEvent: ButtonClickEvent | undefined;
	constructor(handle: ButtonHandle | string) {
		this.handle = typeof handle === 'string' ? createButtonHandle(handle) : handle;
	}
	onClick(onClickEvent: ButtonClickEvent) {
		this.onClickEvent = onClickEvent;
		return this;
	}
	publish() {
		Button.buttons[this.handle.handle] = this;
		return this;
	}
	run(i: ButtonInteraction, data?: string) {
		this.onClickEvent(i, data);
	}
	getButtonID() {
		return this.handle.handle;
	}
}
