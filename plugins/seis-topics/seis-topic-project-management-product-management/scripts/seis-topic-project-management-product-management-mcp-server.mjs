#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-project-management-product-management",
  "displayName": "Product Management",
  "category": "Project Management",
  "categoryId": "project-management",
  "sourceText": "Product Management",
  "sourcePath": "./plugins/seis-topics/seis-topic-project-management-product-management"
});
