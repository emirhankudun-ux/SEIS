#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-automation-command-center",
  "displayName": "Command Center",
  "category": "Automation",
  "categoryId": "automation",
  "sourceText": "Command Center",
  "sourcePath": "./plugins/seis-topics/seis-topic-automation-command-center"
});
