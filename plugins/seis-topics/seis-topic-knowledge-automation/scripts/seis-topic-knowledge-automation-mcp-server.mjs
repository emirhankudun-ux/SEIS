#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-knowledge-automation",
  "displayName": "Automation",
  "category": "Knowledge",
  "categoryId": "knowledge",
  "sourceText": "Automation",
  "sourcePath": "./plugins/seis-topics/seis-topic-knowledge-automation"
});
