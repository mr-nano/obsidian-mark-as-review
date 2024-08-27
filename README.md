# MarkAsReviewed Plugin

The **MarkAsReviewed Plugin** for Obsidian adds a convenient way to mark your notes as reviewed with a single click. This plugin updates your note with a timestamp under the `## Dates` heading, allowing you to track when you last reviewed the note.

## Features

- **Mark as Reviewed Command**: A command is added to Obsidian's command palette, allowing you to mark the active note as reviewed.
- **Header/~~Footer~~ Button**: Adds a button in the header or footer of your notes, depending on your preference. Clicking this button marks the note as reviewed. **Currently only header is supported**
- ~~**Customizable Date & Time Format**~~: The review date and time are added in the `YYYY-mm-dd` format with the time in a 12-hour format, adjusted to the Asia/Kolkata timezone. **The date time is hardcoded right now**
- **Automatic Date Section Management**: If your note contains a `# Dates` section, the plugin will append the review timestamp to it. If the section is not present, it will create one.

## Installation

1. Download the latest release from the [GitHub Releases](https://github.com/your-repo/MarkAsReviewed/releases) page.
2. Place the plugin files in your Obsidian vault's `.obsidian/plugins/MarkAsReviewed` directory.
3. Enable the plugin from the Obsidian settings under the "Community Plugins" section.

## Usage

1. **Marking a Note as Reviewed**:
   - Use the command palette (Cmd/Ctrl+P) to search for "Mark Note as Reviewed" and select it.
   - Alternatively, click the "Mark as Reviewed" button in the header or footer of your note.

2. **Review Tracking**:
   - The plugin will append a line under the `## Dates` section in your note, such as:
     ```
     ## Dates
     - Reviewed on [[25-08-2024]] at 09:30 AM
     ```
   - If the `## Dates` section doesn't exist, the plugin will create it.

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check out the [issues page](https://github.com/your-repo/MarkAsReviewed/issues) if you want to contribute.

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/your-repo/MarkAsReviewed/blob/main/LICENSE) file for details.

## Acknowledgments

- Inspired by the need to keep track of reviewed notes easily in Obsidian.
- Thanks to the Obsidian community for continuous support and ideas.

---

Feel free to modify any part of this to better suit your preferences or project details!