#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-automation-connectors",
  "displayName": "Connectors",
  "category": "Automation",
  "categoryId": "automation",
  "sourceText": "Connectors",
  "sourcePath": "./plugins/seis-topics/seis-topic-automation-connectors"
});
