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

# Run tests (currently minimal test setup)
npm test

# Run specific test suites
npm run test:unit
npm run test:all
```

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

### Core Structure
```
src/content/
├── main.js                    # Entry point and plugin orchestration
├── config/                    # Configuration management
│   ├── index.js              # Editor.js configuration
│   └── debug-config.js       # Debug settings
├── features/                  # Feature modules (plugins)
│   ├── smart-editor/          # Editor.js integration
│   ├── sidebar/               # Sidebar management
│   └── history-sidebar/       # Article history management
├── services/                  # Core services
│   ├── plugin-registry.js     # Plugin management system
│   ├── system-initializer.js  # App services initialization
│   ├── dom-monitor.js         # DOM change monitoring
│   ├── editor-bridge.js       # WeChat editor API bridge
│   └── simple-logger.js       # Logging system
├── tools/                     # Custom Editor.js tools
│   └── custom-wechat-image-tool.js
├── utils/                     # Utilities and helpers
│   ├── parsers/               # HTML conversion system
│   ├── storage/               # Storage services
│   ├── dom.js                # DOM utilities
│   ├── editor.js             # Editor utilities
│   └── toast.js              # UI notifications
└── editorjs-bundle.js         # Editor.js dependencies (entry point)
```

### Key Components

#### 1. System Initialization (`src/content/main.js`)
- Registers feature plugins with the plugin registry
- Initializes editor bridge to communicate with WeChat's editor API via postMessage
- Checks `mp_editor_get_isready` API before initializing features
- Starts DOM monitoring for dynamic content changes
- Includes debug mode error handling

#### 2. Editor Bridge (`src/content/services/editor-bridge.js`)
- Injects `scripts/page-injector.js` into the page context
- Communicates with WeChat's `__MP_Editor_JSAPI__` through postMessage
- Provides `callEditorAPI()` for invoking WeChat editor functions
- Handles asynchronous API responses with callback pattern
- Supports `getWxData()` for accessing WeChat page data

#### 3. Plugin Registry (`src/content/services/plugin-registry.js`)
- Manages plugin lifecycle (register, initialize, cleanup)
- Enforces plugin interface requirements (initialize, cleanup methods)
- Provides `initializeAll()` and `cleanupAll()` for batch operations
- Tracks initialization state to prevent duplicate initialization
- Returns detailed status reports for debugging

#### 4. Storage System (`src/content/utils/storage/`)
- `browser-storage.js` - Browser storage abstraction layer
- `article-storage.js` - Article storage service with metadata
- `article-serializer.js` - Article data serialization/deserialization
- `index.js` - Unified storage interface and initialization

#### 5. HTML Parser System (`src/content/utils/parsers/`)
- `TemplateLoader.js` - Manages CSS styling templates
- `InlineStyleProcessor.js` - Handles text formatting (bold, italic, underline)
- `Renderer.js` - Main rendering engine
- `BlockRendererRegistry.js` - Registry for block type renderers
- `renderers/` - Specific block renderers (Header, Paragraph, List, etc.)
- `index.js` - Main converter class with validation

#### 6. Feature Modules
- **Smart Editor**: Integrates Editor.js with WeChat's editor interface
- **Sidebar**: Manages content navigation and tool panels
- **History Sidebar**: Manages saved article history with storage integration

#### 7. Logging System (`src/content/services/simple-logger.js`)
- Module-specific logger creation
- Debug mode support
- Centralized logging configuration

### Build System (Vite)
- Uses Vite for bundling with custom configuration
- Two main entry points: `src/content/main.js` and `src/editorjs-bundle.js`
- Custom plugin copies manifest.json, background.js, assets, and scripts
- Outputs to `dist/` with proper Chrome extension structure
- Disables code splitting to ensure single-file bundles

## Key Files

### Configuration and Entry Points
- `src/content/main.js` - Main content script entry point
- `src/content/config/index.js` - Editor.js configuration with tools setup
- `src/editorjs-bundle.js` - Editor.js tools bundle
- `manifest.json` - Chrome extension manifest
- `vite.config.js` - Build configuration

### Feature Implementation
- `src/content/features/smart-editor/` - Editor.js integration with UI management
- `src/content/features/sidebar/` - Sidebar functionality with preview
- `src/content/features/history-sidebar/` - Article history with toggle interface
- `src/content/tools/custom-wechat-image-tool.js` - WeChat image uploader tool

### Core Services
- `src/content/services/plugin-registry.js` - Plugin lifecycle management
- `src/content/services/editor-bridge.js` - WeChat API integration
- `src/content/services/dom-monitor.js` - DOM change monitoring
- `src/content/services/system-initializer.js` - Application services initialization
- `src/content/services/simple-logger.js` - Logging infrastructure

### Storage and Data
- `src/content/utils/storage/` - Complete storage system
- `src/content/utils/parsers/` - HTML conversion system

## Development Patterns

### Adding New Features
1. Create plugin module in `src/content/features/[feature-name]/`
2. Implement required plugin interface:
   ```javascript
   export default {
     async initialize() {
       // Feature initialization logic
     },
     cleanup() {
       // Cleanup resources
     },
     isEnabled() {
       // Optional: check if feature should be enabled
       return true;
     }
   };
   ```
3. Register plugin in `src/content/main.js`:
   ```javascript
   import newFeaturePlugin from "./features/new-feature/index.js";
   pluginRegistry.register("new-feature", newFeaturePlugin);
   ```

### Adding Editor.js Tools
1. Import tool in `src/editorjs-bundle.js`
2. Configure tool in `src/content/config/index.js`
3. For custom tools, create in `src/content/tools/`

### Using Storage System
```javascript
import { storage } from '../utils/storage/index.js';

// Save article
await storage.saveArticle(editorData, metadata);

// Load articles
const articles = await storage.getArticles();
```

### HTML Conversion
```javascript
import { convertToHtml } from '../utils/parsers/index.js';

const html = convertToHtml(editorData, template);
```

### Logging
```javascript
import { createLogger } from '../services/simple-logger.js';

const logger = createLogger('ModuleName');
logger.info('Information message');
logger.error('Error message', errorObject);
```

## Technical Details

### WeChat Editor Integration
- Uses `editor-bridge.js` to communicate with WeChat's `__MP_Editor_JSAPI__`
- Monitors `mp_editor_get_isready` API for editor readiness
- Injects `scripts/page-injector.js` to bridge content script and page context
- Uses postMessage for secure cross-context communication

### Chrome Extension Structure
- Manifest V3 extension
- Content scripts injected into WeChat editor pages (`https://mp.weixin.qq.com/cgi-bin/appmsg?*`)
- Uses Chrome storage permissions
- Web accessible resources: `scripts/page-injector.js`, `assets/style-template.json`

### Module System
- ES6 modules throughout (`"type": "module"` in package.json)
- Plugin-based architecture for modularity
- Consistent error handling and logging
- Service-oriented architecture with clear separation of concerns

### Debug Mode
- Configurable via `src/content/config/debug-config.js` or localStorage
- Global error handling in debug mode
- Enhanced logging for development

## Storage Architecture

### Article Storage
- Stores EditorJS data with metadata
- Supports article status tracking (draft, published, etc.)
- Implements search and sorting functionality
- Uses browser extension storage API

### Data Flow
1. User creates content in EditorJS
2. Content saved via ArticleStorageService
3. Serialized using ArticleSerializer
4. Stored in browser storage via BrowserStorage abstraction