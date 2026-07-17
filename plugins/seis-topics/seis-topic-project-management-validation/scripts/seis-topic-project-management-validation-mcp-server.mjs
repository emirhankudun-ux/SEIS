#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-project-management-validation",
  "displayName": "Validation",
  "category": "Project Management",
  "categoryId": "project-management",
  "sourceText": "Validation",
  "sourcePath": "./plugins/seis-topics/seis-topic-project-management-validation"
});
