#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-desktop-macos",
  "displayName": "macOS",
  "category": "Desktop",
  "categoryId": "desktop",
  "sourceText": "macOS",
  "sourcePath": "./plugins/seis-topics/seis-topic-desktop-macos"
});
