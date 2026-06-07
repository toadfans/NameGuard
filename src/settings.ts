import { PluginSettingTab, Setting, type App, type SettingDefinitionItem } from 'obsidian';
import NameGuardPlugin from './main';
import { DEFAULT_SETTINGS, type NameGuardPluginSettings } from './settings-data';

type BooleanSettingKey = {
	[K in keyof NameGuardPluginSettings]: NameGuardPluginSettings[K] extends boolean ? K : never;
}[keyof NameGuardPluginSettings];

interface ToggleDefinition {
	name: string;
	desc: string;
	key: BooleanSettingKey;
}

/** Single source of truth shared by the declarative and imperative renderers. */
const TOGGLES: ToggleDefinition[] = [
	{
		name: 'Markdown notes only',
		desc: 'Only guard .md notes. Turn off to enforce unique names across every file type.',
		key: 'markdownOnly',
	},
	{
		name: 'Show release notes after each update',
		desc: 'Open a window with the latest changelog entries after upgrading to a newer version of the plugin.',
		key: 'showReleaseNotes',
	},
];

export class NameGuardSettingTab extends PluginSettingTab {
	plugin: NameGuardPlugin;

	constructor(app: App, plugin: NameGuardPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinitionItem<keyof NameGuardPluginSettings>[] {
		return TOGGLES.map(
			(toggle): SettingDefinitionItem<keyof NameGuardPluginSettings> => ({
				name: toggle.name,
				desc: toggle.desc,
				control: {
					type: 'toggle',
					key: toggle.key,
					defaultValue: DEFAULT_SETTINGS[toggle.key],
				},
			}),
		);
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		for (const toggle of TOGGLES) {
			new Setting(containerEl)
				.setName(toggle.name)
				.setDesc(toggle.desc)
				.addToggle((control) =>
					control.setValue(this.plugin.settings[toggle.key]).onChange(async (value) => {
						this.plugin.settings[toggle.key] = value;
						await this.plugin.saveSettings();
					}),
				);
		}
	}
}
