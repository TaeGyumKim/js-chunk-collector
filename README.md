# js-chunk-collector

CLI tool to collect JavaScript chunks from web pages during loading. Uses Playwright to capture actual network responses.

> **Note**: This tool is intended for use on websites you own or have explicit permission to analyze. Please respect terms of service and copyright laws.

## Installation

```bash
npm install
npx playwright install chromium
npm run build
```

## Usage

### Basic Usage

Collect all JavaScript files loaded by a page:

```bash
npm run grab -- --url https://example.com
```

### Same-Origin Only

Collect only scripts from the same domain:

```bash
npm run grab -- --url https://example.com --same-origin
```

### With Filtering

Include only specific patterns:

```bash
npm run grab -- --url https://example.com --include "chunk.*\.js"
```

Exclude certain patterns:

```bash
npm run grab -- --url https://example.com --exclude "analytics|tracking"
```

### Lazy Chunk Collection

Trigger dynamic imports by scrolling and clicking:

```bash
npm run grab -- --url https://example.com --scroll 3 --click ".tab-button" --click ".load-more"
```

### Multiple Routes

Navigate through multiple pages on the same site:

```bash
npm run grab -- --url https://example.com --route /about --route /products
```

## CLI Options

| Option | Default | Description |
|--------|---------|-------------|
| `--url <url>` | (required) | URL to collect JavaScript from |
| `--out <dir>` | `./out` | Output directory |
| `--same-origin` | `false` | Only collect same-origin scripts |
| `--include <regex>` | - | Include URLs matching regex |
| `--exclude <regex>` | - | Exclude URLs matching regex |
| `--wait <ms>` | `1500` | Wait time for network idle |
| `--timeout <ms>` | `45000` | Page load timeout |
| `--scroll <n>` | `0` | Number of scroll actions |
| `--click <selector>` | - | Click selector (repeatable) |
| `--hover <selector>` | - | Hover selector (repeatable) |
| `--route <path>` | - | Additional route (repeatable) |

## Output Structure

```
out/
  example.com/
    main.js
    chunk-abc123.js
    static/
      vendor.js
  manifest.json
```

### manifest.json

Contains metadata about collected files:

```json
{
  "version": "1.0",
  "baseUrl": "https://example.com",
  "collectedAt": "2024-01-15T10:30:00.000Z",
  "actions": ["scroll 1/3", "click: .tab-button"],
  "files": [
    {
      "url": "https://example.com/main.js",
      "savedAs": "example.com/main.js",
      "bytes": 125000,
      "contentType": "application/javascript",
      "timestamp": "2024-01-15T10:30:01.000Z"
    }
  ]
}
```

## File Naming Rules

- Files are saved under `out/<host>/<pathname>`
- URLs with query strings get a hash suffix: `file__q_a1b2c3d4.js`
- Files without `.js` extension get it added automatically
- Duplicate URLs are saved only once

## License

MIT
