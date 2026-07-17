#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-desktop-visionos",
  "displayName": "visionOS",
  "category": "Desktop",
  "categoryId": "desktop",
  "sourceText": "visionOS",
  "sourcePath": "./plugins/seis-topics/seis-topic-desktop-visionos"
});
