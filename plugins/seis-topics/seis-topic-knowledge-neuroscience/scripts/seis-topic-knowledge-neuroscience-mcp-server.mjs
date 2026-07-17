#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-knowledge-neuroscience",
  "displayName": "Neuroscience",
  "category": "Knowledge",
  "categoryId": "knowledge",
  "sourceText": "Neuroscience",
  "sourcePath": "./plugins/seis-topics/seis-topic-knowledge-neuroscience"
});
