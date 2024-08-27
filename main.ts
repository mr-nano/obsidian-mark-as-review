import { MarkdownView, Notice, Plugin } from 'obsidian';


export default class MarkAsReviewedPlugin extends Plugin {

	async onload() {
		this.addCommand({
			id: 'mark-note-as-reviewed',
			name: 'Mark Note as Reviewed',
			callback: () => this.markAsReviewed(),
		});
		this.addButton('header');
		
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
		const dateHeadingRegex = /^(#+ ?Dates?)$/gm;
		const matches = [...content.matchAll(dateHeadingRegex)];
		
		let updatedContent;
		if (matches.length > 0) {
			const lastMatch = matches[matches.length - 1];
			const index = lastMatch?.index ?? content.length;
			updatedContent = content.slice(0, index) + 
							content.slice(index).replace(lastMatch?.[0] ?? '', `${lastMatch?.[0] ?? ''}\n${reviewedLine}`);
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

		// TODO - footer does not work. The location is taken to make it more configruable later on.. but currently does not work
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

	
}