#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-automation-scheduling",
  "displayName": "Scheduling",
  "category": "Automation",
  "categoryId": "automation",
  "sourceText": "Scheduling",
  "sourcePath": "./plugins/seis-topics/seis-topic-automation-scheduling"
});
