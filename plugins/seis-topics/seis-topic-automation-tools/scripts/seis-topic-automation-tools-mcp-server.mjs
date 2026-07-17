#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-automation-tools",
  "displayName": "Tools",
  "category": "Automation",
  "categoryId": "automation",
  "sourceText": "Tools",
  "sourcePath": "./plugins/seis-topics/seis-topic-automation-tools"
});
