#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-seis-seis-knowledge-engine",
  "displayName": "SEIS Knowledge Engine",
  "category": "SEIS",
  "categoryId": "seis",
  "sourceText": "SEIS Knowledge Engine",
  "sourcePath": "./plugins/seis-topics/seis-topic-seis-seis-knowledge-engine"
});
