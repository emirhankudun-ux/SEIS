#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-automation-integrations",
  "displayName": "Integrations",
  "category": "Automation",
  "categoryId": "automation",
  "sourceText": "Integrations",
  "sourcePath": "./plugins/seis-topics/seis-topic-automation-integrations"
});
