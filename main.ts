import { App, MarkdownView, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

// Define the settings interface
interface MarkAsReviewedPluginSettings {
    useContext: boolean;
    contextFileName: string;
}

// Define the default settings
const DEFAULT_SETTINGS: MarkAsReviewedPluginSettings = {
    useContext: true,
    contextFileName: '0 Current Context.md',
};

export default class MarkAsReviewedPlugin extends Plugin {
    settings: MarkAsReviewedPluginSettings;

    async onload() {
        console.log('Mark as Reviewed Plugin: Loading...');
        await this.loadSettings();

        this.addCommand({
            id: 'mark-note-as-reviewed',
            name: 'Mark Note as Reviewed',
            callback: () => this.markAsReviewed(),
        });

        this.addSettingTab(new MarkAsReviewedSettingTab(this.app, this));

        this.addButton('header'); // Button placement fix for top-right
        console.log('Mark as Reviewed Plugin: Loaded.');
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        console.log('Mark as Reviewed Plugin: Settings loaded:', this.settings);
    }

    async saveSettings() {
        await this.saveData(this.settings);
        console.log('Mark as Reviewed Plugin: Settings saved:', this.settings);
    }

    // --- MODIFIED getContextTags() FUNCTION ---
    async getContextTags(): Promise<string> {
        console.log('Mark as Reviewed Plugin: Attempting to get context tags from FIRST LINE...');
        if (!this.settings.useContext) {
            console.log('Mark as Reviewed Plugin: Use Context Tags is disabled.');
            return '';
        }

        const contextFilePath = this.settings.contextFileName;
        console.log(`Mark as Reviewed Plugin: Looking for context file at: "${contextFilePath}"`);
        const contextFile = this.app.vault.getAbstractFileByPath(contextFilePath);

        if (!(contextFile instanceof TFile)) {
            new Notice(`Context file "${contextFilePath}" not found. Please check your plugin settings.`);
            console.warn(`Mark as Reviewed Plugin: Context file "${contextFilePath}" not found or is not a file.`);
            return '';
        }
        
        console.log(`Mark as Reviewed Plugin: Context file found: "${contextFile.path}"`);
        const content = await this.app.vault.read(contextFile);
        const lines = content.split('\n');
        console.log('Mark as Reviewed Plugin: Context file content lines:', lines.length);

        if (lines.length === 0) {
            console.log('Mark as Reviewed Plugin: Context file is empty.');
            return '';
        }

        const firstLine = lines[0]; // ONLY check the first line
        console.log(`Mark as Reviewed Plugin: Checking first line: "${firstLine}"`);

        // Regex to match lines with date, time, and tags, specifically looking for '#active'
        const activeContextRegex = /^\[\[\d{4}-\d{2}-\d{2}\]\] at \d{2}:\d{2}:\d{2} - #active\s*(.*)$/;
        const match = firstLine.match(activeContextRegex);

        let tagsToUse = ''; // This will store the formatted tags (e.g., " for context #tag1 #tag2")

        if (match) {
            console.log('Mark as Reviewed Plugin: First line matched active context pattern!');
            const capturedStringAfterActive = match[1].trim(); 
            console.log('Mark as Reviewed Plugin: Captured string after #active:', `"${capturedStringAfterActive}"`);

            // Split by whitespace, filter out empty strings and ensure they start with #
            const foundTags = capturedStringAfterActive.split(/\s+/)
                                                       .filter(tag => tag.startsWith('#') && tag !== '#active');

            if (foundTags.length > 0) {
                tagsToUse = ` for context ${foundTags.join(' ')}`;
                console.log('Mark as Reviewed Plugin: Extracted and formatted context tags:', `"${tagsToUse}"`);
            } else {
                // If #active was found, but no other tags followed, then no context tags are added.
                tagsToUse = ''; // Explicitly ensure it's empty if no valid tags found
                console.log('Mark as Reviewed Plugin: Found #active, but no additional tags found on first line.');
            }
        } else {
            console.log('Mark as Reviewed Plugin: First line does NOT contain active context pattern.');
        }

        console.log('Mark as Reviewed Plugin: Final context tags to append:', `"${tagsToUse}"`);
        return tagsToUse;
    }
    // --- END MODIFIED getContextTags() FUNCTION ---


    async markAsReviewed() {
        console.log("Mark as Reviewed Plugin: markAsReviewed function called.");
        const activeFile = this.app.workspace.getActiveFile();

        if (!activeFile) {
            new Notice("No active file to mark as reviewed.");
            console.warn("Mark as Reviewed Plugin: No active file.");
            return;
        }
        console.log(`Mark as Reviewed Plugin: Active file: "${activeFile.path}"`);

        const content = await this.app.vault.read(activeFile);
        const now = new Date();
        const dateStr = now.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$2-$1'); // Format to YYYY-MM-DD
        
        const timeStr = now.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        console.log(`Mark as Reviewed Plugin: Current date: ${dateStr}, time: ${timeStr}`);

        let contextTagsAndPhrase = ''; 
        if (this.settings.useContext) {
            contextTagsAndPhrase = await this.getContextTags();
            console.log(`Mark as Reviewed Plugin: Full context phrase from getContextTags(): "${contextTagsAndPhrase}"`);
        } else {
            console.log("Mark as Reviewed Plugin: Context tagging is disabled in settings.");
        }

        const reviewedLine = `- Reviewed on [[${dateStr}]] at ${timeStr}${contextTagsAndPhrase}`; 
        console.log(`Mark as Reviewed Plugin: Full reviewed line: "${reviewedLine}"`);

        const dateHeadingRegex = /^(#+ ?Dates?)$/gm;
        const matches = [...content.matchAll(dateHeadingRegex)];
        console.log('Mark as Reviewed Plugin: Date heading matches found:', matches.length);
        
        let updatedContent;
        if (matches.length > 0) {
            const lastMatch = matches[matches.length - 1];
            const index = (lastMatch?.index ?? content.length) + (lastMatch?.[0]?.length ?? 0); 
            console.log(`Mark as Reviewed Plugin: Inserting after heading at index: ${index}`);
            
            updatedContent = content.slice(0, index) + `\n${reviewedLine}` + content.slice(index);
        } else {
            updatedContent = `${content}\n\n## Dates\n${reviewedLine}`;
            console.log("Mark as Reviewed Plugin: No 'Dates' heading found, appending new section.");
        }

        await this.app.vault.modify(activeFile, updatedContent);
        new Notice(`Note "${activeFile.name}" marked as reviewed!`);
        console.log(`Mark as Reviewed Plugin: Successfully updated file "${activeFile.name}"`);
    }

    addButton(location: string) {
        const button = this.addRibbonIcon('check-circle', 'Mark as Reviewed', () => {
            this.markAsReviewed();
        });

        if (location === 'header') {
            this.app.workspace.on('layout-change', () => {
                const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (activeView) {
                    const containerEl = activeView.containerEl.querySelector('.view-header'); 
                    
                    if (containerEl && !containerEl.querySelector('.mark-as-reviewed-button')) {
                        const newButton = button.cloneNode(true) as HTMLElement;
                        newButton.addClass('mark-as-reviewed-button');
                        containerEl.appendChild(newButton); 
                        newButton.onclick = () => this.markAsReviewed();
                        console.log(`Mark as Reviewed Plugin: Added button to ${location}`);
                    }
                }
            });
        }
    }

    onunload() {
        console.log('Mark as Reviewed Plugin: Unloading Mark as Reviewed Plugin');
    }
}

class MarkAsReviewedSettingTab extends PluginSettingTab {
    plugin: MarkAsReviewedPlugin;

    constructor(app: App, plugin: MarkAsReviewedPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        console.log('Mark as Reviewed Plugin: Displaying settings tab.');
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Mark as Reviewed Settings' });

        new Setting(containerEl)
            .setName('Use Context Tags')
            .setDesc('Enable this to include tags from your context file in the reviewed line.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.useContext)
                .onChange(async (value) => {
                    this.plugin.settings.useContext = value;
                    console.log('Mark as Reviewed Plugin: UseContext changed to:', value);
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Context File Name')
            .setDesc('Specify the name of your context file (e.g., "0 Current Context.md").')
            .addText(text => text
                .setPlaceholder('0 Current Context.md')
                .setValue(this.plugin.settings.contextFileName)
                .onChange(async (value) => {
                    this.plugin.settings.contextFileName = value;
                    console.log('Mark as Reviewed Plugin: ContextFileName changed to:', value);
                    await this.plugin.saveSettings();
                }));
        console.log('Mark as Reviewed Plugin: Settings tab displayed.');
    }
}