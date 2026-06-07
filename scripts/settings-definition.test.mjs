import { readFileSync } from 'node:fs';
import { test, expect } from 'vitest';
import { loadNameGuardSettings } from '../src/settings-data';

test('settings tab exposes declarative definitions with a fallback renderer', () => {
	const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
	const source = readFileSync('src/settings.ts', 'utf8');
	const exposedKeys = Array.from(source.matchAll(/key: '([^']+)'/g), (match) => match[1]);

	expect(manifest.minAppVersion).toBe('1.8.7');
	expect(source).toMatch(/getSettingDefinitions\s*\(/);
	expect(source).toContain('display(): void');
	expect(exposedKeys).toEqual(['markdownOnly', 'showReleaseNotes']);
});

test('stored settings cannot override hidden controls', () => {
	const source = readFileSync('src/main.ts', 'utf8');
	const settings = loadNameGuardSettings({
		enabled: false,
		onlyInShortestMode: false,
		guardRename: false,
		guardCopy: true,
		markdownOnly: false,
		showNotice: false,
		showReleaseNotes: false,
		previousRelease: '0.0.2',
	});

	expect(source).toContain('loadNameGuardSettings');
	expect(source).not.toContain('Object.assign');
	expect(settings).toEqual({
		markdownOnly: false,
		showReleaseNotes: false,
		previousRelease: '0.0.2',
	});
});
