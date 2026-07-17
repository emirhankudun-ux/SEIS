#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-project-management-evidence",
  "displayName": "Evidence",
  "category": "Project Management",
  "categoryId": "project-management",
  "sourceText": "Evidence",
  "sourcePath": "./plugins/seis-topics/seis-topic-project-management-evidence"
});
