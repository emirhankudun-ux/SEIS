#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-project-management",
  "displayName": "Project Management",
  "category": "Project Management",
  "categoryId": "project-management",
  "sourceText": "Project Management",
  "sourcePath": "./plugins/seis-topics/seis-topic-project-management"
});
