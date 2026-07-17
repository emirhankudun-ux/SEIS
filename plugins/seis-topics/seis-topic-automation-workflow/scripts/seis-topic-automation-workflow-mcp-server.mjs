#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-automation-workflow",
  "displayName": "Workflow",
  "category": "Automation",
  "categoryId": "automation",
  "sourceText": "Workflow",
  "sourcePath": "./plugins/seis-topics/seis-topic-automation-workflow"
});
