# NameSnapper Firefox Extension

A Firefox extension that helps you "snap" (extract and collect) names and text content from web pages.

## Features

- Extract names from web pages using intelligent pattern matching
- Store snapped names locally in your browser
- Simple popup interface for easy access
- Context menu integration
- Automatically filters out common non-name text

## Installation

### For Development

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on"
4. Navigate to the NameSnapper folder and select the `manifest.json` file
5. The extension will be loaded and available in your browser toolbar

### For Distribution

1. Zip all the extension files
2. Submit to Firefox Add-ons (AMO) for review and distribution

## Files Structure

```
NameSnapper/
├── manifest.json       # Extension configuration
├── popup.html         # Extension popup interface
├── popup.js           # Popup functionality
├── background.js      # Background script
├── content.js         # Content script (runs on web pages)
├── icons/             # Extension icons (you need to add your own)
└── README.md          # This file
```

## How It Works

1. **Content Script**: Runs on all web pages and can extract names using various CSS selectors and patterns
2. **Background Script**: Manages data storage and handles communication between components
3. **Popup**: Provides user interface for triggering name extraction and viewing results

## Usage

1. Navigate to any web page
2. Click the NameSnapper icon in your browser toolbar
3. Click "Snap Names on Page" to extract names from the current page
4. Click "View Snapped Names" to see recently collected names
5. Click "Clear All Data" to remove all stored names

## Customization

You can modify the name extraction patterns in `content.js` by editing the `nameSelectors` array to target specific elements on the types of websites you're interested in.

## Icons

You'll need to add your own icon files in the `icons/` folder:
- icon-16.png (16x16 pixels)
- icon-32.png (32x32 pixels)
- icon-48.png (48x48 pixels)
- icon-128.png (128x128 pixels)

## Privacy

This extension stores all data locally in your browser using Firefox's storage API. No data is sent to external servers.

## License

This project is open source. Feel free to modify and distribute according to your needs.
