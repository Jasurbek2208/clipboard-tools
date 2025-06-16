# clipboard-tools
A minimal clipboard utility package with fallback and advanced usage.

## Features
- Copy plain text / html / links / url
- Secure clipboard auto-clear after timeout
- Optional toast or callbacks on success/failure
- Append timestamp for cache-busting
- Include/exclude host in shared links
- Graceful fallback for unsupported Clipboard APIs

## Install
```bash
npm install clipboard-tools
```

## Usage
```ts
import { copy } from "clipboard-tools";

copy("Hello", { type: "text", showToast: true });
copy("<b>Hello</b>", { type: "html", htmlFallbackText: "Hello" });
copy("Important!", { type: "link", appendTimestamp: true });
copy("", { type: "url" });
```

## License
MIT