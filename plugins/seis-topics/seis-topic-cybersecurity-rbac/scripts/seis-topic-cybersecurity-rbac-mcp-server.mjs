#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cybersecurity-rbac",
  "displayName": "RBAC",
  "category": "Cybersecurity",
  "categoryId": "cybersecurity",
  "sourceText": "RBAC",
  "sourcePath": "./plugins/seis-topics/seis-topic-cybersecurity-rbac"
});
