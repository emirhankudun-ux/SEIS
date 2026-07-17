#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-knowledge-ar",
  "displayName": "AR",
  "category": "Knowledge",
  "categoryId": "knowledge",
  "sourceText": "AR",
  "sourcePath": "./plugins/seis-topics/seis-topic-knowledge-ar"
});
