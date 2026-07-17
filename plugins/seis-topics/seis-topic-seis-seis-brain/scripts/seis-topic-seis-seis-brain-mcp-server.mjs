#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-seis-seis-brain",
  "displayName": "SEIS Brain",
  "category": "SEIS",
  "categoryId": "seis",
  "sourceText": "SEIS Brain",
  "sourcePath": "./plugins/seis-topics/seis-topic-seis-seis-brain"
});
