#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-seis-seis-workflow-engine",
  "displayName": "SEIS Workflow Engine",
  "category": "SEIS",
  "categoryId": "seis",
  "sourceText": "SEIS Workflow Engine",
  "sourcePath": "./plugins/seis-topics/seis-topic-seis-seis-workflow-engine"
});
