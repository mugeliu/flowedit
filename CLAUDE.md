# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FlowEdit is a Chrome extension that enhances the WeChat Official Account Platform editor by integrating Editor.js and intelligent features. The extension targets `https://mp.weixin.qq.com/cgi-bin/appmsg?*` and provides a modern rich-text editing experience with enhanced tools and sidebar management.

## Development Commands

### Build and Development
```bash
# Install dependencies
npm install

# Build the extension (creates dist/ directory)
npm run build

# Run tests
npm test

# Run specific test suites
npm run test:unit
npm run test:all
```

### Testing
- Tests are located in the `test/` directory
- Use `node test/test-block-to-html.js` to test HTML conversion functionality
- Open `test/test-runner.html` in browser for interactive testing

### Chrome Extension Development
1. Run `npm run build` to create the dist/ directory
2. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked extension"
   - Select the `dist/` directory

## Code Architecture

### Plugin-Based Architecture
The extension uses a plugin registry system (`src/content/services/plugin-registry.js`) where features are registered as plugins with standardized interfaces:
- `initialize()` - Plugin initialization
- `cleanup()` - Resource cleanup
- `isEnabled()` - Feature toggle check

### Core Structure
```
src/content/
├── main.js                    # Entry point and plugin orchestration
├── config/                    # Editor.js configuration and feature toggles
├── features/                  # Feature modules (plugins)
│   ├── smart-editor/          # Editor.js integration
│   └── sidebar/               # Sidebar management
├── services/                  # Core services
│   ├── plugin-registry.js     # Plugin management system
│   ├── system-initializer.js  # App services initialization
│   ├── dom-watcher.js         # DOM change monitoring
│   └── editor-bridge.js       # WeChat editor API bridge
├── tools/                     # Custom Editor.js tools
├── utils/                     # Utilities and parsers
│   └── parsers/               # HTML conversion system
└── editorjs-bundle.js         # Editor.js dependencies
```

### Key Components

#### 1. System Initialization (`src/content/main.js`)
- Registers feature plugins with the plugin registry
- Initializes editor bridge to communicate with WeChat's editor API
- Checks editor readiness before initializing features
- Starts DOM watcher for dynamic content monitoring

#### 2. Editor Configuration (`src/content/config/index.js`)
- Defines Editor.js tools and their configurations
- Manages feature toggles and positioning
- Contains DOM selectors for WeChat editor elements
- Configures custom tools like WeChat image uploader

#### 3. HTML Parser System (`src/content/utils/parsers/`)
- Converts Editor.js blocks to HTML with proper styling
- Handles inline styles (bold, italic, underline)
- Template-based rendering system
- Supports custom block types and styling

#### 4. Feature Modules
- **Smart Editor**: Integrates Editor.js with WeChat's editor
- **Sidebar**: Manages content navigation and tools
- Each feature implements the plugin interface

### Build System (Vite)
- Uses Vite for bundling with custom configuration
- Separate entry points for content script and editor bundle
- Automatic asset copying and manifest management
- Outputs to `dist/` directory with proper Chrome extension structure

## Key Files

### Configuration and Entry Points
- `src/content/main.js` - Main content script entry point
- `src/content/config/index.js` - Editor.js configuration
- `src/editorjs-bundle.js` - Editor.js tools bundle
- `manifest.json` - Chrome extension manifest
- `vite.config.js` - Build configuration

### Feature Implementation
- `src/content/features/smart-editor/` - Editor.js integration
- `src/content/features/sidebar/` - Sidebar functionality
- `src/content/tools/custom-wechat-image-tool.js` - WeChat image uploader

### Core Services
- `src/content/services/plugin-registry.js` - Plugin management
- `src/content/services/editor-bridge.js` - WeChat API integration
- `src/content/services/dom-watcher.js` - DOM monitoring
- `src/content/utils/parsers/index.js` - HTML conversion

### Testing
- `test/test-block-to-html.js` - HTML conversion tests
- `test/block-to-html/` - Parser test modules
- `test/test-runner.html` - Browser test runner

## Development Patterns

### Adding New Features
1. Create plugin module in `src/content/features/`
2. Implement plugin interface (initialize, cleanup, isEnabled)
3. Register plugin in `src/content/main.js`
4. Add configuration in `src/content/config/index.js` if needed

### Adding Editor.js Tools
1. Import tool in `src/editorjs-bundle.js`
2. Configure tool in `src/content/config/index.js`
3. For custom tools, create in `src/content/tools/`

### HTML Conversion
- Use parser system in `src/content/utils/parsers/`
- Template-based approach with style configuration
- Supports custom block processors

## Technical Details

### WeChat Editor Integration
- Uses `editor-bridge.js` to communicate with WeChat's editor API
- Monitors `mp_editor_get_isready` API for editor readiness
- Targets specific DOM elements defined in `selectorConfig`

### Chrome Extension Structure
- Manifest V3 extension
- Content scripts injected into WeChat editor pages
- Uses Chrome storage and scripting permissions
- Web accessible resources for dynamic loading

### Module System
- ES6 modules throughout
- Dynamic imports for feature loading
- Consistent error handling and logging