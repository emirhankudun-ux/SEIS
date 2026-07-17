#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-project-management-architecture-governance",
  "displayName": "Architecture Governance",
  "category": "Project Management",
  "categoryId": "project-management",
  "sourceText": "Architecture Governance",
  "sourcePath": "./plugins/seis-topics/seis-topic-project-management-architecture-governance"
});
