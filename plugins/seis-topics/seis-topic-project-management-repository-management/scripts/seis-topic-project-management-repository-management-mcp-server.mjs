#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-project-management-repository-management",
  "displayName": "Repository Management",
  "category": "Project Management",
  "categoryId": "project-management",
  "sourceText": "Repository Management",
  "sourcePath": "./plugins/seis-topics/seis-topic-project-management-repository-management"
});
