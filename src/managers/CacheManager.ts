/* eslint-disable @typescript-eslint/no-explicit-any */
class CacheManager extends Map {

	get(key: string): unknown | undefined {
		return super.get(key);
	}

	set(key: string, value: unknown): this {
		return super.set(key, value);
	}

	has(key: string): boolean {
		return super.has(key);
	}

	delete(key: string): boolean {
		return super.delete(key);
	}

	clear(): void {
		return super.clear();
	}

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	find(fn: any, thisArg = undefined): unknown | undefined {
		if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
		for (const [key, val] of this) {
			if (fn(val, key, this)) return val;
		}
		return undefined;
	}

	toArray(): unknown[] {
		return [...this.values()];
	}
}

export default CacheManager;