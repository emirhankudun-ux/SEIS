#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-desktop-windows",
  "displayName": "Windows",
  "category": "Desktop",
  "categoryId": "desktop",
  "sourceText": "Windows",
  "sourcePath": "./plugins/seis-topics/seis-topic-desktop-windows"
});
