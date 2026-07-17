#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-seis-seis-ai-desktop",
  "displayName": "SEIS AI Desktop",
  "category": "SEIS",
  "categoryId": "seis",
  "sourceText": "SEIS AI Desktop",
  "sourcePath": "./plugins/seis-topics/seis-topic-seis-seis-ai-desktop"
});
