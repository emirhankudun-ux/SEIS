#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-automation-task-management",
  "displayName": "Task Management",
  "category": "Automation",
  "categoryId": "automation",
  "sourceText": "Task Management",
  "sourcePath": "./plugins/seis-topics/seis-topic-automation-task-management"
});
