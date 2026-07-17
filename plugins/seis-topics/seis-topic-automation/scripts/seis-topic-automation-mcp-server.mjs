#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-automation",
  "displayName": "Automation",
  "category": "Automation",
  "categoryId": "automation",
  "sourceText": "Automation",
  "sourcePath": "./plugins/seis-topics/seis-topic-automation"
});
