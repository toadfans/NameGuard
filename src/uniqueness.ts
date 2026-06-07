/**
 * Pure, dependency-free decision logic for NameGuard.
 *
 * This module is intentionally free of any Obsidian imports so the rules can be
 * unit-tested in isolation. Tests live in the in-source vitest block at the
 * bottom of the file and are stripped from the production bundle by esbuild.
 */

export interface GuardContext {
	/** Master switch. */
	enabled: boolean;
	/** Only act when the vault's link format is `shortest`. */
	onlyInShortestMode: boolean;
	/** Only guard markdown notes. */
	markdownOnly: boolean;
	/** Current value of the vault's `newLinkFormat` config. */
	linkFormat: string;
	/** Whether a file with the given basename already exists in the vault. */
	basenameExists: (basename: string) => boolean;
}

export interface GuardDecision {
	/** Whether the operation should be blocked. */
	block: boolean;
	/** The basename the decision was made for, with its original casing. */
	basename: string;
}

const MARKDOWN_EXTENSION = '.md';

const allow = (basename: string): GuardDecision => ({ block: false, basename });

/** Strip the directory and a trailing file extension from a vault path. */
function basenameOf(path: string): string {
	const name = path.split('/').pop() ?? path;
	const dot = name.lastIndexOf('.');
	return dot > 0 ? name.slice(0, dot) : name;
}

/** Whether a path is subject to guarding under the current gates. */
function isGuardablePath(path: string, ctx: GuardContext): boolean {
	if (!ctx.enabled) return false;
	if (ctx.onlyInShortestMode && ctx.linkFormat !== 'shortest') return false;
	if (ctx.markdownOnly && !path.toLowerCase().endsWith(MARKDOWN_EXTENSION)) return false;
	return true;
}

/** Decide whether creating a file at `path` should be blocked. */
export function shouldBlockCreate(path: string, ctx: GuardContext): GuardDecision {
	const basename = basenameOf(path);
	if (!isGuardablePath(path, ctx)) return allow(basename);
	return { block: ctx.basenameExists(basename), basename };
}

/**
 * Decide whether renaming/moving a file (currently named `oldBasename`) to
 * `newPath` should be blocked. A pure move that keeps the same basename is
 * always allowed because it introduces no new name into the vault.
 */
export function shouldBlockRename(
	oldBasename: string,
	newPath: string,
	ctx: GuardContext,
): GuardDecision {
	const basename = basenameOf(newPath);
	if (!isGuardablePath(newPath, ctx)) return allow(basename);
	if (basename.toLowerCase() === oldBasename.toLowerCase()) return allow(basename);
	return { block: ctx.basenameExists(basename), basename };
}

if (import.meta.vitest) {
	const { describe, expect, it } = import.meta.vitest;

	const ctx = (over: Partial<GuardContext> = {}): GuardContext => ({
		enabled: true,
		onlyInShortestMode: true,
		markdownOnly: true,
		linkFormat: 'shortest',
		basenameExists: (b) => b.toLowerCase() === 'foobar',
		...over,
	});

	describe('basenameOf', () => {
		it('strips folder and markdown extension', () => {
			expect(basenameOf('a/b/Foobar.md')).toBe('Foobar');
		});
		it('strips any extension', () => {
			expect(basenameOf('x/image.png')).toBe('image');
		});
		it('keeps dotfiles intact', () => {
			expect(basenameOf('.gitignore')).toBe('.gitignore');
		});
	});

	describe('shouldBlockCreate', () => {
		it('blocks a colliding markdown basename in shortest mode', () => {
			expect(shouldBlockCreate('notes/Foobar.md', ctx()).block).toBe(true);
		});
		it('is case-insensitive', () => {
			expect(shouldBlockCreate('notes/FOOBAR.md', ctx()).block).toBe(true);
		});
		it('allows a free basename', () => {
			expect(shouldBlockCreate('notes/Unique.md', ctx()).block).toBe(false);
		});
		it('does nothing when disabled', () => {
			expect(shouldBlockCreate('notes/Foobar.md', ctx({ enabled: false })).block).toBe(false);
		});
		it('does nothing outside shortest mode', () => {
			expect(shouldBlockCreate('notes/Foobar.md', ctx({ linkFormat: 'absolute' })).block).toBe(
				false,
			);
		});
		it('enforces in any link format when onlyInShortestMode is off', () => {
			expect(
				shouldBlockCreate(
					'notes/Foobar.md',
					ctx({ linkFormat: 'absolute', onlyInShortestMode: false }),
				).block,
			).toBe(true);
		});
		it('ignores non-markdown files when markdownOnly is on', () => {
			expect(shouldBlockCreate('notes/Foobar.png', ctx()).block).toBe(false);
		});
		it('guards non-markdown files when markdownOnly is off', () => {
			expect(shouldBlockCreate('notes/Foobar.canvas', ctx({ markdownOnly: false })).block).toBe(
				true,
			);
		});
	});

	describe('shouldBlockRename', () => {
		it('allows a pure move that keeps the basename', () => {
			expect(shouldBlockRename('Foobar', 'archive/Foobar.md', ctx()).block).toBe(false);
		});
		it('blocks a rename into an existing basename', () => {
			expect(shouldBlockRename('Draft', 'notes/Foobar.md', ctx()).block).toBe(true);
		});
		it('allows a rename into a free basename', () => {
			expect(shouldBlockRename('Draft', 'notes/Unique.md', ctx()).block).toBe(false);
		});
	});
}
