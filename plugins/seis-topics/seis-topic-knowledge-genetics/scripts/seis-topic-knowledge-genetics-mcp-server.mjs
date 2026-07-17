#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-knowledge-genetics",
  "displayName": "Genetics",
  "category": "Knowledge",
  "categoryId": "knowledge",
  "sourceText": "Genetics",
  "sourcePath": "./plugins/seis-topics/seis-topic-knowledge-genetics"
});
