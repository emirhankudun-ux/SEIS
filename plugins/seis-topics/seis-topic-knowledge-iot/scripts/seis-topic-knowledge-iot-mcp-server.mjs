#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-knowledge-iot",
  "displayName": "IoT",
  "category": "Knowledge",
  "categoryId": "knowledge",
  "sourceText": "IoT",
  "sourcePath": "./plugins/seis-topics/seis-topic-knowledge-iot"
});
