import fs from 'node:fs';

export function capitalize(string: string): string {
	if(typeof string !== 'string') return '';
	return string.charAt(0).toUpperCase() + string.slice(1);
}

export function clean(text: string): string {
	if (typeof text === 'string') {
		return text
			.replace(/`/g, `\`${String.fromCharCode(8203)}`)
			.replace(/@/g, `@${String.fromCharCode(8203)}`)
			.replace(/```/g, '\\`\\`\\`')
			.replace(/(?<=^|[^`])`(?=[^`]|$)/g, '\\`');
	}
	return text;
}

export function removeElement(arr: Array<unknown>, value: unknown): Array<unknown> {
	const index = arr.indexOf(value);
	if (index > -1) {
		arr.splice(index, 1);
	}
	return arr;
}

export function trimArray(arr: Array<unknown>, maxLen = 10): Array<unknown> {
	if (arr.length > maxLen) {
		const len = arr.length - maxLen;
		arr = arr.slice(0, maxLen);
		arr.push(`and **${len}** more...`);
	}
	return arr;
}

export function trimStringFromArray(arr: Array<unknown>, maxLen = 2048, joinChar = '\n'): string {
	let string = arr.join(joinChar);
	const diff = maxLen - 15;
	if (string.length > maxLen) {
		string = string.slice(0, string.length - (string.length - diff));
		string = string.slice(0, string.lastIndexOf(joinChar));
		string = string + `\nAnd **${arr.length - string.split('\n').length}** more...`;
	}
	return string;
}

export function getRange(arr: Array<unknown>, current: number, interval: number): string {
	const max = (arr.length > current + interval) ? current + interval : arr.length;
	current = current + 1;
	const range = (arr.length == 1 || arr.length == current || interval == 1) ? `[${current}]` : `[${current} - ${max}]`;
	return range;
}

export function getOrdinalNumeral(number: number | string): string {
	number = number.toString();
	if (number === '11' || number === '12' || number === '13') return number + 'th';
	if (number.endsWith('1')) return number + 'st';
	else if (number.endsWith('2')) return number + 'nd';
	else if (number.endsWith('3')) return number + 'rd';
	else return number + 'th';
}

export function getStatus(...args: Array<unknown>): 'Disabled' | 'Enabled' {
	for (const arg of args) {
		if (!arg) return 'Disabled';
	}
	return 'Enabled';
}

export function isEmpty(obj: Record<string, never>): boolean {
	for(const prop in obj) {
		if(Object.prototype.hasOwnProperty.call(obj, prop)) {
			return false;
		}
	}
  
	return JSON.stringify(obj) === JSON.stringify({});
}

export function replaceKeywords(message: string): string {
	if (!message) {return message;}
	else {
		return message
			.replace(/\?member/g, '`?member`')
			.replace(/\?username/g, '`?username`')
			.replace(/\?tag/g, '`?tag`')
			.replace(/\?size/g, '`?size`');
	}
}

export function sleep(ms: number): Promise<unknown> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// eslint-disable-next-line no-useless-escape
export const URLRegex = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi

let isDockerCached: boolean | undefined;

function hasDockerEnv() {
	try {
		fs.statSync('/.dockerenv');
		return true;
	} catch {
		return false;
	}
}

function hasDockerCGroup() {
	try {
		return fs.readFileSync('/proc/self/cgroup', 'utf8').includes('docker');
	} catch {
		return false;
	}
}

export function isDocker(): boolean {
	if (isDockerCached === undefined) {
		isDockerCached = hasDockerEnv() || hasDockerCGroup();
	}

	return isDockerCached;
}