#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-knowledge-human-ai-collaboration",
  "displayName": "Human-AI Collaboration",
  "category": "Knowledge",
  "categoryId": "knowledge",
  "sourceText": "Human-AI Collaboration",
  "sourcePath": "./plugins/seis-topics/seis-topic-knowledge-human-ai-collaboration"
});
