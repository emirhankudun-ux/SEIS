#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-desktop-web",
  "displayName": "Web",
  "category": "Desktop",
  "categoryId": "desktop",
  "sourceText": "Web",
  "sourcePath": "./plugins/seis-topics/seis-topic-desktop-web"
});
