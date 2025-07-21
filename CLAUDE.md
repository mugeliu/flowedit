# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FlowEdit is a Chrome extension that enhances the WeChat Official Account Platform editor by integrating Editor.js and intelligent features. The extension targets `https://mp.weixin.qq.com/cgi-bin/appmsg*` and provides a modern rich-text editing experience with enhanced tools, sidebar management, and a comprehensive settings system.

## Development Guidelines

### Code Quality
- Always use descriptive variable names

## Development Commands

### Build and Development
```bash
# Install dependencies
npm install

# Build all components (content script, EditorJS bundle, React apps)
npm run build

# Build individual components
npm run build:content    # Content script only
npm run build:editorjs   # EditorJS bundle only  
npm run build:react      # React apps (popup & options) only

# Development mode (content script)
npm run dev

# Run tests (currently minimal test setup)
npm test
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

### Multi-Build System Architecture
The extension uses a sophisticated build system with three separate Vite configurations:
- **vite.content.config.js** - Content script and static assets
- **vite.editorjs.config.js** - EditorJS tools bundle 
- **vite.react.config.js** - React applications (popup & options)

### Plugin-Based Content Script Architecture
The content script uses a plugin registry system (`src/content/services/plugin-registry.js`) where features are registered as plugins with standardized interfaces:
- `initialize()` - Plugin initialization (required)
- `cleanup()` - Resource cleanup (required)
- `isEnabled()` - Feature toggle check (optional)

### Core Structure
```
src/
├── content/                   # Content script (main extension functionality)
│   ├── main.js               # Entry point and plugin orchestration
│   ├── config/               # Editor.js configuration
│   │   └── index.js          # Editor.js tools and settings
│   ├── features/             # Feature modules (plugins)
│   │   ├── smart-editor/     # Editor.js integration with WeChat
│   │   ├── sidebar/          # Content navigation sidebar
│   │   └── history-sidebar/  # Article history management
│   ├── services/             # Core content script services
│   │   ├── plugin-registry.js        # Plugin lifecycle management
│   │   ├── system-initializer.js     # Application services initialization
│   │   ├── dom-monitor.js            # DOM change monitoring
│   │   ├── editor-bridge.js          # WeChat editor API bridge
│   │   └── template-initializer.js   # Template system initialization
│   ├── tools/                # Custom Editor.js tools
│   │   └── custom-wechat-image-tool.js
│   └── utils/                # Content script utilities
│       ├── dom.js            # DOM manipulation utilities
│       ├── editor.js         # Editor utilities
│       └── toast.js          # UI notifications
├── shared/                   # Shared components and services
│   ├── components/           # React UI components (shadcn/ui)
│   │   ├── ui/               # Base UI components
│   │   ├── hooks/            # React hooks
│   │   └── lib/              # Component utilities
│   ├── config/               # Shared configuration
│   │   └── debug-config.js   # Debug settings
│   ├── services/             # Shared business logic services
│   │   ├── logger.js         # Centralized logging system
│   │   ├── template-manager.js       # Template management service
│   │   ├── parsers/          # HTML conversion system
│   │   │   ├── index.js      # Main converter interface
│   │   │   ├── BlockRendererRegistry.js
│   │   │   ├── InlineStyleProcessor.js
│   │   │   ├── Renderer.js
│   │   │   ├── TemplateLoader.js
│   │   │   └── renderers/    # Block-specific renderers
│   │   └── storage/          # Storage abstraction layer
│   │       ├── index.js      # Unified storage interface
│   │       ├── browser-storage.js    # Chrome storage abstraction
│   │       ├── article-storage.js    # Article management service
│   │       └── article-serializer.js # Data serialization
│   ├── styles/               # Global styles
│   │   └── globals.css       # Tailwind CSS globals
│   └── utils/                # Shared utilities
│       └── index.ts          # TypeScript utilities
├── popup/                    # React popup application
│   ├── App.tsx               # Main popup component
│   ├── index.html            # Popup HTML template
│   └── index.tsx             # Popup entry point
├── options/                  # React options application
│   ├── App.tsx               # Main options component
│   ├── index.html            # Options HTML template
│   ├── index.tsx             # Options entry point
│   └── components/           # Options-specific components
│       ├── app-sidebar.tsx   # Options navigation
│       ├── general-settings.tsx
│       ├── editor-settings.tsx
│       ├── theme-settings.tsx
│       └── [other-settings].tsx
└── editorjs-bundle.js        # EditorJS tools bundle entry
```

[Rest of the document remains unchanged]