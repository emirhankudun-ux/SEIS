#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-seis",
  "displayName": "SEIS",
  "category": "SEIS",
  "categoryId": "seis",
  "sourceText": "SEIS",
  "sourcePath": "./plugins/seis-topics/seis-topic-seis"
});
