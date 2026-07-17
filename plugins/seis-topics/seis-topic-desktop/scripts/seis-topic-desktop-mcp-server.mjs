#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-desktop",
  "displayName": "Desktop",
  "category": "Desktop",
  "categoryId": "desktop",
  "sourceText": "Desktop",
  "sourcePath": "./plugins/seis-topics/seis-topic-desktop"
});
