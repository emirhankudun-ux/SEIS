#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-project-management-milestones",
  "displayName": "Milestones",
  "category": "Project Management",
  "categoryId": "project-management",
  "sourceText": "Milestones",
  "sourcePath": "./plugins/seis-topics/seis-topic-project-management-milestones"
});
