#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-automation-plugins",
  "displayName": "Plugins",
  "category": "Automation",
  "categoryId": "automation",
  "sourceText": "Plugins",
  "sourcePath": "./plugins/seis-topics/seis-topic-automation-plugins"
});
