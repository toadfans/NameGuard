export interface NameGuardPluginSettings {
	markdownOnly: boolean;
	showReleaseNotes: boolean;
	previousRelease: string;
}

export const DEFAULT_SETTINGS: NameGuardPluginSettings = {
	markdownOnly: true,
	showReleaseNotes: true,
	previousRelease: '',
};

export function loadNameGuardSettings(
	data?: Partial<NameGuardPluginSettings> | null,
): NameGuardPluginSettings {
	return {
		...DEFAULT_SETTINGS,
		markdownOnly: data?.markdownOnly ?? DEFAULT_SETTINGS.markdownOnly,
		showReleaseNotes: data?.showReleaseNotes ?? DEFAULT_SETTINGS.showReleaseNotes,
		previousRelease: data?.previousRelease ?? DEFAULT_SETTINGS.previousRelease,
	};
}
