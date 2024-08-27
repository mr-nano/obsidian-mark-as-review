import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MarkAsReviewedPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'mark-note-as-reviewed',
			name: 'Mark Note as Reviewed',
			callback: () => this.markAsReviewed(),
		});
		this.addButton('header');

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	async markAsReviewed() {
		console.log("Marking as reviewed");
		const activeFile = this.app.workspace.getActiveFile();

		if (!activeFile) return;

		const content = await this.app.vault.read(activeFile);
		const now = new Date();
		const dateStr = now.toLocaleString('en-IN', {
			timeZone: 'Asia/Kolkata',
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		}).replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$2-$1');
		const timeStr = now.toLocaleString('en-IN', {
			timeZone: 'Asia/Kolkata',
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});

		const reviewedLine = `- Reviewed on [[${dateStr}]] at ${timeStr}`;
		const dateHeadingRegex = /^(#+ ?Dates?)$/m;
		const dateHeadingMatch = content.match(dateHeadingRegex);

		let updatedContent;
		if (dateHeadingMatch) {
			const [fullMatch] = dateHeadingMatch;
			updatedContent = content.replace(fullMatch, `${fullMatch}\n${reviewedLine}`);
		} else {
			updatedContent = `${content}\n\n## Dates\n${reviewedLine}`;
		}

		await this.app.vault.modify(activeFile, updatedContent);
		new Notice(`Note "${activeFile.name}" marked as reviewed`);

	}

	addButton(location: string) {
		const button = this.addRibbonIcon('check-circle', 'Mark as Reviewed', () => {
			this.markAsReviewed();
		});

		if (location === 'header' || location === 'footer') {
			this.app.workspace.on('layout-change', () => {
				const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (activeView) {
					const containerEl = location === 'header' 
						? activeView.containerEl.querySelector('.view-header') 
						: activeView.containerEl.querySelector('.view-footer');
					
					if (containerEl && !containerEl.querySelector('.mark-as-reviewed-button')) {
						const newButton = button.cloneNode(true) as HTMLElement;
						newButton.addClass('mark-as-reviewed-button');
						containerEl.appendChild(newButton);
						newButton.onclick = () => this.markAsReviewed();
					}
				}
			});
		}
	}

	onunload() {
		console.log('Unloading Mark as Reviewed Plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MarkAsReviewedPlugin;

	constructor(app: App, plugin: MarkAsReviewedPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
