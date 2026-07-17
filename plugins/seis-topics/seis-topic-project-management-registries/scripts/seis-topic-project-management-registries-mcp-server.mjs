#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-project-management-registries",
  "displayName": "Registries",
  "category": "Project Management",
  "categoryId": "project-management",
  "sourceText": "Registries",
  "sourcePath": "./plugins/seis-topics/seis-topic-project-management-registries"
});
