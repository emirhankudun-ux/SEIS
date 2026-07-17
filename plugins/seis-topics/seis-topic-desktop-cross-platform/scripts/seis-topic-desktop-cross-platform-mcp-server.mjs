#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-desktop-cross-platform",
  "displayName": "Cross Platform",
  "category": "Desktop",
  "categoryId": "desktop",
  "sourceText": "Cross Platform",
  "sourcePath": "./plugins/seis-topics/seis-topic-desktop-cross-platform"
});
