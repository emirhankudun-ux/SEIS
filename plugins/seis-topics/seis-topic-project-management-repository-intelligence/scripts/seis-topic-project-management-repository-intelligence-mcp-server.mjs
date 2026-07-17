#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-project-management-repository-intelligence",
  "displayName": "Repository Intelligence",
  "category": "Project Management",
  "categoryId": "project-management",
  "sourceText": "Repository Intelligence",
  "sourcePath": "./plugins/seis-topics/seis-topic-project-management-repository-intelligence"
});
