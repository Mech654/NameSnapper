# NameSnapper 🎯

**Smart Character Name Detection Browser Extension**

NameSnapper is an intelligent browser extension that automatically detects and highlights character names in web novels, stories, and chapter content. Using advanced content analysis and natural language processing techniques, it helps readers keep track of characters while reading.

## ✨ Features

### 🧠 **Intelligent Content Detection**
- **Smart Content Container Detection**: Automatically finds the actual story content, ignoring navigation, headers, footers, and UI elements
- **Multi-tier Detection Strategy**: Prioritizes specific content selectors, semantic elements, and smart div analysis
- **Content Purity Analysis**: Distinguishes between pure story content and mixed UI content

### 🎯 **Advanced Name Recognition**
- **Pattern-Based Analysis**: Uses sophisticated algorithms to identify potential character names
- **Context-Aware Detection**: Analyzes word frequency, sentence position, and contextual clues
- **Smart Filtering**: Avoids marking headers, titles, and first words after punctuation
- **Merge Adjacent Names**: Combines related name parts (e.g., "John Smith" from separate highlights)

### 🎨 **User-Friendly Interface**
- **Modern Popup UI**: Beautiful gradient design with intuitive controls
- **Real-time Feedback**: Shows marking progress and results
- **Name Storage**: Automatically saves discovered names for future reference
- **Easy Management**: View, clear, and manage stored names

### ⚙️ **Smart Configuration**
- **Automatic Operation**: Works on any website with substantial text content
- **Content Quality Scoring**: Ensures only high-quality content containers are processed
- **Minimal False Positives**: Advanced filtering reduces incorrect name detection

## 🚀 Installation

### For Development
1. Clone this repository:
   ```bash
   git clone https://github.com/namesnapper/extension.git
   cd NameSnapper
   ```

2. **Firefox**:
   - Open `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file

3. **Chrome/Edge**:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extension folder

### From Store (Coming Soon)
- Firefox Add-ons Store
- Chrome Web Store

## 📖 How to Use

1. **Navigate to any web novel or story page**
2. **Click the NameSnapper extension icon** in your browser toolbar
3. **Click "Mark Names on Page"** to analyze the content
4. **Watch as character names are highlighted** in yellow
5. **Use "View Stored Names"** to see all discovered names
6. **Use "Remove Highlights"** to clear markings
7. **Use "Clear All Names"** to reset stored data

## 🎯 How It Works

### Content Detection Pipeline
1. **Tier 1**: Searches for specific content containers (`#chr-content`, `.chapter-content`, etc.)
2. **Tier 2**: Analyzes semantic elements (`<article>`, `<main>`, `<section>`)
3. **Tier 3**: Smart div detection with wrapper avoidance
4. **Tier 4**: Fallback to body with size limits

### Name Recognition Algorithm
1. **Text Analysis**: Extracts and analyzes all capitalized words
2. **Pattern Recognition**: Identifies potential names based on:
   - Word frequency and distribution
   - Position within sentences
   - Context and surrounding punctuation
3. **Quality Filtering**: Removes false positives using:
   - First-word detection (avoids sentence starters)
   - Strong tag filtering (skips headers/titles)
   - Symbol and punctuation awareness
4. **Post-Processing**: Merges adjacent names and saves results

## 🔧 Technical Details

### Architecture
- **Content Script**: `content.js` - Main detection and highlighting logic
- **Background Script**: `background.js` - Extension lifecycle and storage management
- **Popup Interface**: `popup.html` + `popup.js` - User interface and controls
- **Manifest**: `manifest.json` - Extension configuration and permissions

### Key Technologies
- **DOM Tree Walking**: Efficient text node traversal
- **Regex Pattern Matching**: Advanced name pattern recognition
- **Local Storage**: Persistent name storage across sessions
- **Message Passing**: Communication between extension components

### Browser Compatibility
- ✅ Firefox (Manifest V2)
- ✅ Chrome (Manifest V2)  
- ✅ Edge (Manifest V2)
- 🔄 Safari (In Development)

## 🎨 Customization

### Supported Websites
NameSnapper works on any website with text content, but is optimized for:
- **Web Novel Sites**: NovelBin, Royal Road, Webnovel, etc.
- **Blog Posts**: Medium, WordPress, etc.
- **Documentation**: GitBook, Wiki pages, etc.
- **News Articles**: Any news website
- **Story Platforms**: AO3, FanFiction.Net, etc.

### Content Requirements
- Minimum 100 words of content
- Proper HTML structure with content containers
- Text organized in paragraphs or similar elements

## 🛠️ Development

### File Structure
```
NameSnapper/
├── manifest.json          # Extension configuration
├── content.js            # Main detection logic
├── background.js         # Background processes
├── popup.html           # User interface
├── popup.js             # UI logic
├── marker.png           # Extension icon
├── icon-generator.html  # Icon creation tool
└── README.md           # Documentation
```

### Building
No build process required - this is a pure JavaScript extension.

### Testing
Test on the included `exampleChapter.html` or any web novel site.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Known Issues

- Some websites with unusual HTML structures may require manual content container detection
- Very large pages (>10,000 words) may experience slower processing
- Names in unusual formats or non-English characters may not be detected

## 🔮 Planned Features

- [ ] **Custom Highlight Colors**: User-selectable highlight colors
- [ ] **Export Names**: Export discovered names to various formats
- [ ] **Name Categories**: Organize names by character types
- [ ] **Statistics**: Show name frequency and usage statistics
- [ ] **Dark Mode**: Support for dark theme interfaces
- [ ] **Keyboard Shortcuts**: Quick access to extension functions

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/namesnapper/extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/namesnapper/extension/discussions)
- **Email**: support@namesnapper.dev

---

**Made with ❤️ for web novel readers everywhere**
