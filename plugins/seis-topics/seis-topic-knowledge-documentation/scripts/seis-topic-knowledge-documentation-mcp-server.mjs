#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-knowledge-documentation",
  "displayName": "Documentation",
  "category": "Knowledge",
  "categoryId": "knowledge",
  "sourceText": "Documentation",
  "sourcePath": "./plugins/seis-topics/seis-topic-knowledge-documentation"
});
