#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-seis-seis-intelligence-cube",
  "displayName": "SEIS Intelligence Cube",
  "category": "SEIS",
  "categoryId": "seis",
  "sourceText": "SEIS Intelligence Cube",
  "sourcePath": "./plugins/seis-topics/seis-topic-seis-seis-intelligence-cube"
});
