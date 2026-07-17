#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-automation-orchestration",
  "displayName": "Orchestration",
  "category": "Automation",
  "categoryId": "automation",
  "sourceText": "Orchestration",
  "sourcePath": "./plugins/seis-topics/seis-topic-automation-orchestration"
});
