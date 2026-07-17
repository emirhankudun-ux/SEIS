#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-project-management-ontology",
  "displayName": "Ontology",
  "category": "Project Management",
  "categoryId": "project-management",
  "sourceText": "Ontology",
  "sourcePath": "./plugins/seis-topics/seis-topic-project-management-ontology"
});
