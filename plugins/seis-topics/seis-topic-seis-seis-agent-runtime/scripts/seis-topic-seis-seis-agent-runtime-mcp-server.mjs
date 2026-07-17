#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-seis-seis-agent-runtime",
  "displayName": "SEIS Agent Runtime",
  "category": "SEIS",
  "categoryId": "seis",
  "sourceText": "SEIS Agent Runtime",
  "sourcePath": "./plugins/seis-topics/seis-topic-seis-seis-agent-runtime"
});
