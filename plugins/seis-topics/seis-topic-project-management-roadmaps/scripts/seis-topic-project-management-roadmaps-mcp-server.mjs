#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-project-management-roadmaps",
  "displayName": "Roadmaps",
  "category": "Project Management",
  "categoryId": "project-management",
  "sourceText": "Roadmaps",
  "sourcePath": "./plugins/seis-topics/seis-topic-project-management-roadmaps"
});
