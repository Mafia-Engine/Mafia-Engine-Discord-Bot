export async function AsyncForEach<T>(array: T[], onEach: (value: T, index: number) => Promise<void>) {
	for (let i = 0; i < array.length; i++) {
		await onEach(array[i], i);
	}
}
