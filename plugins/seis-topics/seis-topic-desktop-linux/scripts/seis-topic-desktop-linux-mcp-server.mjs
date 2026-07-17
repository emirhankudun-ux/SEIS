#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-desktop-linux",
  "displayName": "Linux",
  "category": "Desktop",
  "categoryId": "desktop",
  "sourceText": "Linux",
  "sourcePath": "./plugins/seis-topics/seis-topic-desktop-linux"
});
