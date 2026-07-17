#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-automation-pipelines",
  "displayName": "Pipelines",
  "category": "Automation",
  "categoryId": "automation",
  "sourceText": "Pipelines",
  "sourcePath": "./plugins/seis-topics/seis-topic-automation-pipelines"
});
