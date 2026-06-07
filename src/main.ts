import { Plugin } from 'obsidian';
import { isVersionNewerThanOther } from './changelog';
import { installNameGuard } from './name-guard';
import { ReleaseNotesModal } from './release-notes-modal';
import { DEFAULT_SETTINGS, NameGuardPluginSettings, NameGuardSettingTab } from './settings';

export default class NameGuardPlugin extends Plugin {
	settings!: NameGuardPluginSettings;

	async onload() {
		await this.loadSettings();

		// Wrap the vault mutation methods so duplicate names are blocked before
		// a file is ever created. Wrappers are restored on unload.
		installNameGuard(this);

		this.addCommand({
			id: 'show-release-notes',
			name: 'Show release notes',
			callback: () => {
				new ReleaseNotesModal(this.app, this, this.manifest.version).open();
			},
		});

		this.addSettingTab(new NameGuardSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(() => this.maybeShowReleaseNotes());
	}

	private maybeShowReleaseNotes(): void {
		if (!this.settings.showReleaseNotes) return;
		const current = this.manifest.version;
		const previous = this.settings.previousRelease;
		if (!previous) {
			this.settings.previousRelease = current;
			void this.saveSettings();
			return;
		}
		if (!isVersionNewerThanOther(current, previous)) return;
		new ReleaseNotesModal(this.app, this, current).open();
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<NameGuardPluginSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
