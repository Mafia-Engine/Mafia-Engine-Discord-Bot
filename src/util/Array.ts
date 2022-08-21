export async function AsyncForEach<T>(array: T[], onEach: (value: T, index: number) => Promise<void>) {
	for (let i = 0; i < array.length; i++) {
		await onEach(array[i], i);
	}
}

export async function AsyncForEachTryCatch<T>(array: T[], onEach: (value: T, index: number) => Promise<void>) {
	for (let i = 0; i < array.length; i++) {
		try {
			await onEach(array[i], i);
		} catch (err) {
			console.log(err);
		}
	}
}
