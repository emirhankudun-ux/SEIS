#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-desktop-android",
  "displayName": "Android",
  "category": "Desktop",
  "categoryId": "desktop",
  "sourceText": "Android",
  "sourcePath": "./plugins/seis-topics/seis-topic-desktop-android"
});
