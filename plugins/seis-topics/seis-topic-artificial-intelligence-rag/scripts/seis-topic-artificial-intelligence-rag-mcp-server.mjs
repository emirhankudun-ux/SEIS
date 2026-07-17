#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-rag",
  "displayName": "RAG",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "RAG",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-rag"
});
