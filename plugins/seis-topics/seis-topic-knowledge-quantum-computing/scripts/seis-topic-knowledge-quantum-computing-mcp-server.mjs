#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-knowledge-quantum-computing",
  "displayName": "Quantum Computing",
  "category": "Knowledge",
  "categoryId": "knowledge",
  "sourceText": "Quantum Computing",
  "sourcePath": "./plugins/seis-topics/seis-topic-knowledge-quantum-computing"
});
