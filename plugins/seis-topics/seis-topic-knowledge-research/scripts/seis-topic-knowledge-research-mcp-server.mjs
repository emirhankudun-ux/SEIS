#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-knowledge-research",
  "displayName": "Research",
  "category": "Knowledge",
  "categoryId": "knowledge",
  "sourceText": "Research",
  "sourcePath": "./plugins/seis-topics/seis-topic-knowledge-research"
});
