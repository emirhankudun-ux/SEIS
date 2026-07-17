#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-project-management-permissions",
  "displayName": "Permissions",
  "category": "Project Management",
  "categoryId": "project-management",
  "sourceText": "Permissions",
  "sourcePath": "./plugins/seis-topics/seis-topic-project-management-permissions"
});
