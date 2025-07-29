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


## Key Technologies

### Frontend Technologies
- **React 19** with TypeScript for popup and options pages
- **Vite** for modern build tooling with multiple configurations
- **Tailwind CSS** with shadcn/ui components for consistent UI design
- **Editor.js** v2.30.8 as the core rich-text editor
- **Chrome Extension Manifest V3** for extension functionality

### Editor.js Tools
- **Built-in Tools**: Header, Paragraph, List, Quote, Code, Image, Delimiter, Raw
- **Inline Tools**: Marker, Underline, Inline Code
- **Custom Tools**: WeChat Image Tool for platform-specific image handling
- **Third-party**: Drag & Drop functionality

### UI Framework
- **shadcn/ui** components with Radix UI primitives
- **Lucide React** icons
- **next-themes** for theme management
- **Sonner** for toast notifications
- **WeUI** for WeChat-style components

## File Structure Details

### Configuration Files
- **manifest.json** - Chrome extension manifest
- **package.json** - Node.js dependencies and scripts
- **tsconfig.json** - TypeScript configuration
- **tailwind.config.js** - Tailwind CSS configuration
- **postcss.config.cjs** - PostCSS configuration
- **components.json** - shadcn/ui configuration
- **vite.*.config.js** - Build configurations for different targets

### Asset Management
```
assets/
├── css/                      # Static CSS files
│   ├── content.css          # Content script styles
│   └── weui.css             # WeChat UI styles
├── icons/                   # Extension icons (16, 32, 48, 64, 128px)
├── templates/               # Article templates
│   ├── default.json
│   ├── business-minimal.json
│   ├── literary-green.json
│   └── [other-templates].json
└── test-data.json          # Development test data
```

### Content Script Architecture

#### Plugin System
The content script uses a registry-based plugin architecture where each feature is a self-contained plugin:

```javascript
// Plugin interface
{
  initialize(): Promise<void>,    // Required: Setup plugin
  cleanup(): Promise<void>,       // Required: Teardown plugin  
  isEnabled(): boolean           // Optional: Feature toggle check
}
```

#### Core Services
- **plugin-registry.js** - Manages plugin lifecycle and dependencies
- **system-initializer.js** - Initializes core application services
- **dom-monitor.js** - Monitors DOM changes for WeChat editor detection
- **editor-bridge.js** - Provides API bridge to WeChat editor functionality
- **template-initializer.js** - Manages template system initialization

#### Feature Plugins
- **smart-editor/** - Main Editor.js integration with WeChat platform
- **sidebar/** - Content navigation and management sidebar
- **history-sidebar/** - Article history and draft management

### Shared Services Architecture

#### Storage Layer
```javascript
// Unified storage interface (src/shared/services/storage/)
├── index.js              # Main storage interface  
├── browser-storage.js    # Chrome storage API wrapper
├── article-storage.js    # Article management service
└── article-serializer.js # Data serialization utilities
```

#### Template System
```javascript
// Template processing (src/shared/services/parsers/)
├── index.js                    # Main converter interface
├── BlockRendererRegistry.js    # Registry for block renderers
├── InlineStyleProcessor.js     # Inline style processing
├── Renderer.js                 # Template rendering engine
├── TemplateLoader.js          # Template loading utilities
└── renderers/                 # Block-specific renderers
    ├── BaseBlockRenderer.js   # Base renderer class
    ├── HeaderRenderer.js      # Header block renderer
    ├── ParagraphRenderer.js   # Paragraph block renderer
    ├── ImageRenderer.js       # Image block renderer
    └── [other-renderers].js
```

#### Logging System
Centralized logging service (`src/shared/services/logger.js`) with:
- Debug level filtering
- Chrome extension context awareness
- Structured log output

### React Applications

#### Popup Application
Simple status and quick actions interface:
- Extension status display
- Quick toggle controls
- Navigation to options page

#### Options Application
Comprehensive settings management with sidebar navigation:
- **overview-settings.tsx** - Dashboard and overview
- **general-settings.tsx** - General extension settings
- **editor-settings.tsx** - Editor.js configuration
- **editor-page-settings.tsx** - WeChat editor page settings
- **styles-settings.tsx** - Theme and appearance settings
- **history-settings.tsx** - Article history management
- **about-settings.tsx** - About and help information

### UI Components

#### Shared Components
```javascript
// shadcn/ui components (src/shared/components/ui/)
├── button.tsx           # Button variations
├── card.tsx            # Card container
├── input.tsx           # Form inputs
├── select.tsx          # Dropdown selects
├── sidebar.tsx         # Navigation sidebar
├── badge.tsx           # Status badges
├── skeleton.tsx        # Loading skeletons
├── sonner.tsx          # Toast notifications
└── [other-ui].tsx
```

#### Custom Components
- **preview-dialog.tsx** - Template preview modal
- **use-mobile.tsx** - Mobile detection hook

## Development Workflow

### Extension Development Cycle
1. **Development**: `npm run dev` for content script hot reload
2. **Build**: `npm run build` to create distribution files
3. **Test**: Load unpacked extension in Chrome from `dist/` directory
4. **Deploy**: Package `dist/` directory for Chrome Web Store

### Build System Details

#### Multi-Target Build Process
Each Vite configuration targets specific functionality:

**vite.content.config.js**:
- Builds content script and utilities
- Handles static asset copying
- Optimizes for injection into web pages

**vite.editorjs.config.js**:
- Bundles Editor.js tools and dependencies
- Creates isolated bundle for content script consumption
- Handles Editor.js plugin compatibility

**vite.react.config.js**:
- Builds React applications (popup + options)
- Handles TypeScript compilation
- Optimizes React bundle size

### Code Quality Standards

#### TypeScript Usage
- Strict TypeScript configuration
- Type definitions for Chrome APIs
- Shared type definitions in `src/shared/utils/index.ts`

#### CSS Architecture
- Tailwind CSS utility classes
- Global styles in `src/shared/styles/globals.css`
- Component-scoped styles using CSS modules when needed
- WeUI integration for WeChat-consistent styling

#### Code Organization
- Feature-based organization for content script plugins
- Shared services for cross-cutting concerns
- Clear separation between content script, background, and React apps
- Consistent import/export patterns throughout codebase

## Debugging and Monitoring

### Debug Configuration
Central debug configuration in `src/shared/config/debug-config.js`:
- Feature toggle flags
- Logging level controls
- Development mode settings

### Chrome Extension Debugging
- Content script debugging in DevTools Console
- Background script debugging in Extension DevTools
- React app debugging in dedicated DevTools instances
- Storage inspection via Chrome DevTools Application tab

## Browser Compatibility

### Target Platform
- **Primary**: Chrome/Chromium browsers with Manifest V3 support
- **WeChat Platform**: Optimized for `https://mp.weixin.qq.com/cgi-bin/appmsg*`
- **Editor Integration**: Compatible with WeChat's native editor interface

### Extension Permissions
Based on manifest.json requirements:
- Active tab access for WeChat editor pages
- Storage permissions for settings and article management
- Host permissions for WeChat platform domains