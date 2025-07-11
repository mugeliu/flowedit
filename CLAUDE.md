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
- `initialize()` - Plugin initialization (required)
- `cleanup()` - Resource cleanup (required)
- `isEnabled()` - Feature toggle check (optional)
- `isActive()` - Current activation state (optional)

### Core Structure
```
src/content/
├── main.js                    # Entry point and plugin orchestration
├── config/                    # Editor.js configuration and feature toggles
├── features/                  # Feature modules (plugins)
│   ├── smart-editor/          # Editor.js integration
│   ├── sidebar/               # Sidebar management
│   └── history-sidebar/       # Article history management
├── services/                  # Core services
│   ├── plugin-registry.js     # Plugin management system
│   ├── system-initializer.js  # App services initialization
│   ├── dom-watcher.js         # DOM change monitoring
│   └── editor-bridge.js       # WeChat editor API bridge
├── tools/                     # Custom Editor.js tools
├── utils/                     # Utilities and parsers
│   └── parsers/               # HTML conversion system
└── editorjs-bundle.js         # Editor.js dependencies (entry point)
```

### Key Components

#### 1. System Initialization (`src/content/main.js`)
- Registers feature plugins with the plugin registry
- Initializes editor bridge to communicate with WeChat's editor API via postMessage
- Checks `mp_editor_get_isready` API before initializing features
- Starts DOM watcher for dynamic content monitoring

#### 2. Editor Bridge (`src/content/services/editor-bridge.js`)
- Injects `scripts/page-injector.js` into the page context
- Communicates with WeChat's `__MP_Editor_JSAPI__` through postMessage
- Provides `callEditorAPI()` for invoking WeChat editor functions
- Handles asynchronous API responses with callback pattern

#### 3. Plugin Registry (`src/content/services/plugin-registry.js`)
- Manages plugin lifecycle (register, initialize, cleanup)
- Enforces plugin interface requirements
- Provides `initializeAll()` for batch plugin initialization
- Tracks initialization state to prevent duplicate initialization

#### 4. HTML Parser System (`src/content/utils/parsers/`)
- `TemplateLoader.js` - Manages CSS styling templates
- `InlineStyleProcessor.js` - Handles text formatting (bold, italic, underline)
- `Renderer.js` - Converts Editor.js blocks to HTML
- `index.js` - Main converter class with validation

#### 5. Feature Modules
- **Smart Editor**: Integrates Editor.js with WeChat's editor, provides rich editing interface
- **Sidebar**: Manages content navigation and tools
- **History Sidebar**: Manages saved article history with storage integration

### Build System (Vite)
- Uses Vite for bundling with custom configuration
- Two main entry points: `src/content/main.js` and `src/editorjs-bundle.js`
- Custom plugin copies manifest.json, background.js, assets, and scripts
- Outputs to `dist/` with proper Chrome extension structure
- Disables code splitting to ensure single-file bundles

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
- `src/content/features/history-sidebar/` - Article history management
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
2. Implement required plugin interface (`initialize`, `cleanup`)
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
- Uses `editor-bridge.js` to communicate with WeChat's `__MP_Editor_JSAPI__`
- Monitors `mp_editor_get_isready` API for editor readiness
- Injects `scripts/page-injector.js` to bridge content script and page context
- Uses postMessage for secure cross-context communication

### Chrome Extension Structure
- Manifest V3 extension
- Content scripts injected into WeChat editor pages (`https://mp.weixin.qq.com/cgi-bin/appmsg?*`)
- Uses Chrome storage and scripting permissions
- Web accessible resources for dynamic loading

### Module System
- ES6 modules throughout (`"type": "module"` in package.json)
- Dynamic imports for feature loading
- Plugin-based architecture for modularity
- Consistent error handling and logging