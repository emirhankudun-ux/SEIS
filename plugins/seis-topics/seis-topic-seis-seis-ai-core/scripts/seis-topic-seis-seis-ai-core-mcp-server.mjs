#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-seis-seis-ai-core",
  "displayName": "SEIS AI Core",
  "category": "SEIS",
  "categoryId": "seis",
  "sourceText": "SEIS AI Core",
  "sourcePath": "./plugins/seis-topics/seis-topic-seis-seis-ai-core"
});
