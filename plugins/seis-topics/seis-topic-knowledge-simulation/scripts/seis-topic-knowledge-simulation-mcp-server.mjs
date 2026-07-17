#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-knowledge-simulation",
  "displayName": "Simulation",
  "category": "Knowledge",
  "categoryId": "knowledge",
  "sourceText": "Simulation",
  "sourcePath": "./plugins/seis-topics/seis-topic-knowledge-simulation"
});
