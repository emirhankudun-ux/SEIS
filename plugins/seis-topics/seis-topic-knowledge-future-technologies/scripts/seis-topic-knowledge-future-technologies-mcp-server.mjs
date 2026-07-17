#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-knowledge-future-technologies",
  "displayName": "Future Technologies",
  "category": "Knowledge",
  "categoryId": "knowledge",
  "sourceText": "Future Technologies",
  "sourcePath": "./plugins/seis-topics/seis-topic-knowledge-future-technologies"
});
