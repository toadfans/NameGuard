import { Notice, TFile, type DataWriteOptions, type TAbstractFile, type Vault } from 'obsidian';
import type NameGuardPlugin from './main';
import {
	shouldBlockCreate,
	shouldBlockRename,
	type GuardContext,
	type GuardDecision,
} from './uniqueness';

/** Obsidian exposes a per-vault config accessor that is not in the public types. */
type VaultWithConfig = Vault & { getConfig?(key: string): unknown };

/**
 * Install the uniqueness guards by wrapping the vault mutation methods that
 * every higher-level create/move funnels through (`FileManager.renameFile`
 * calls `vault.rename` internally, "create from link" and templates call
 * `vault.create`, and so on). All wrappers are restored automatically when the
 * plugin unloads via `plugin.register`.
 */
export function installNameGuard(plugin: NameGuardPlugin): void {
	const vault = plugin.app.vault;

	const context = (): GuardContext => {
		const linkFormat = (vault as VaultWithConfig).getConfig?.('newLinkFormat');
		return {
			enabled: plugin.settings.enabled,
			onlyInShortestMode: plugin.settings.onlyInShortestMode,
			markdownOnly: plugin.settings.markdownOnly,
			linkFormat: typeof linkFormat === 'string' ? linkFormat : '',
			basenameExists: (basename) => basenameExists(plugin, basename),
		};
	};

	const blocked = (decision: GuardDecision, verb: string): Error => {
		const existing = plugin.app.metadataCache.getFirstLinkpathDest(decision.basename, '');
		const location = existing ? ` at "${existing.path}"` : '';
		if (plugin.settings.showNotice) {
			const notice = new Notice(
				`NameGuard: a note named "${decision.basename}" already exists${location}. ${capitalize(verb)} blocked.`,
			);
			notice.messageEl.addClass('name-guard-blocked-notice');
		}
		return new Error(`NameGuard blocked ${verb}: duplicate name "${decision.basename}"`);
	};

	const originalCreate = vault.create.bind(vault);
	vault.create = (path: string, data: string, options?: DataWriteOptions) => {
		const decision = shouldBlockCreate(path, context());
		if (decision.block) return Promise.reject(blocked(decision, 'creation'));
		return originalCreate(path, data, options);
	};
	plugin.register(() => {
		vault.create = originalCreate;
	});

	const originalCreateBinary = vault.createBinary.bind(vault);
	vault.createBinary = (path: string, data: ArrayBuffer, options?: DataWriteOptions) => {
		const decision = shouldBlockCreate(path, context());
		if (decision.block) return Promise.reject(blocked(decision, 'creation'));
		return originalCreateBinary(path, data, options);
	};
	plugin.register(() => {
		vault.createBinary = originalCreateBinary;
	});

	const originalRename = vault.rename.bind(vault);
	vault.rename = (file: TAbstractFile, newPath: string) => {
		if (plugin.settings.guardRename && file instanceof TFile) {
			const decision = shouldBlockRename(file.basename, newPath, context());
			if (decision.block) return Promise.reject(blocked(decision, 'rename'));
		}
		return originalRename(file, newPath);
	};
	plugin.register(() => {
		vault.rename = originalRename;
	});

	const originalCopy = vault.copy.bind(vault);
	vault.copy = ((file: TAbstractFile, newPath: string) => {
		if (plugin.settings.guardCopy) {
			const decision = shouldBlockCreate(newPath, context());
			if (decision.block) return Promise.reject(blocked(decision, 'copy'));
		}
		return originalCopy(file, newPath);
	}) as typeof vault.copy;
	plugin.register(() => {
		vault.copy = originalCopy;
	});
}

/**
 * Whether a file with `basename` already exists. The markdown fast path reuses
 * Obsidian's own resolver; the new file is not yet indexed when the guard runs,
 * so a hit always means a pre-existing file.
 */
function basenameExists(plugin: NameGuardPlugin, basename: string): boolean {
	if (plugin.app.metadataCache.getFirstLinkpathDest(basename, '')) return true;
	if (plugin.settings.markdownOnly) return false;
	const lower = basename.toLowerCase();
	return plugin.app.vault.getFiles().some((file) => file.basename.toLowerCase() === lower);
}

function capitalize(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
