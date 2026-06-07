import { readFileSync } from 'node:fs';
import { test, expect } from 'vitest';

test('settings tab exposes declarative definitions with a fallback renderer', () => {
	const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
	const source = readFileSync('src/settings.ts', 'utf8');

	expect(manifest.minAppVersion).toBe('1.8.7');
	expect(source).toMatch(/getSettingDefinitions\s*\(/);
	expect(source).toContain('display(): void');
	expect(source).toContain("key: 'enabled'");
	expect(source).toContain("key: 'showReleaseNotes'");
});
