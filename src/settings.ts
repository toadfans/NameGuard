import { PluginSettingTab, Setting, type App, type SettingDefinitionItem } from 'obsidian';
import NameGuardPlugin from './main';

export interface NameGuardPluginSettings {
	mySetting: string;
	previousRelease: string;
	showReleaseNotes: boolean;
}

export const DEFAULT_SETTINGS: NameGuardPluginSettings = {
	mySetting: 'default',
	previousRelease: '',
	showReleaseNotes: true,
};

export class NameGuardSettingTab extends PluginSettingTab {
	plugin: NameGuardPlugin;

	constructor(app: App, plugin: NameGuardPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinitionItem<keyof NameGuardPluginSettings>[] {
		return [
			{
				name: 'Secret demo',
				desc: "It's a secret",
				control: {
					type: 'text',
					key: 'mySetting',
					placeholder: 'Enter your secret',
					defaultValue: DEFAULT_SETTINGS.mySetting,
				},
			},
			{
				name: 'Show release notes after each update',
				desc: 'Open a window with the latest changelog entries after upgrading to a newer version of the plugin.',
				control: {
					type: 'toggle',
					key: 'showReleaseNotes',
					defaultValue: DEFAULT_SETTINGS.showReleaseNotes,
				},
			},
		];
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Settings #1')
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder('Enter your secret')
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('Show release notes after each update')
			.setDesc(
				'Open a window with the latest changelog entries after upgrading to a newer version of the plugin. (Legacy)',
			)
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.showReleaseNotes).onChange(async (value) => {
					this.plugin.settings.showReleaseNotes = value;
					await this.plugin.saveSettings();
				}),
			);
	}
}
