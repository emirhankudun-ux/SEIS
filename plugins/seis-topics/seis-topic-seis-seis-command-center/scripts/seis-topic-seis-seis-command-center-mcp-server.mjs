#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-seis-seis-command-center",
  "displayName": "SEIS Command Center",
  "category": "SEIS",
  "categoryId": "seis",
  "sourceText": "SEIS Command Center",
  "sourcePath": "./plugins/seis-topics/seis-topic-seis-seis-command-center"
});
