#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-desktop-ios",
  "displayName": "iOS",
  "category": "Desktop",
  "categoryId": "desktop",
  "sourceText": "iOS",
  "sourcePath": "./plugins/seis-topics/seis-topic-desktop-ios"
});
