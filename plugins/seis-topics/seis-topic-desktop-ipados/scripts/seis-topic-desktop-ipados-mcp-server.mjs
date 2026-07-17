#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-desktop-ipados",
  "displayName": "iPadOS",
  "category": "Desktop",
  "categoryId": "desktop",
  "sourceText": "iPadOS",
  "sourcePath": "./plugins/seis-topics/seis-topic-desktop-ipados"
});
