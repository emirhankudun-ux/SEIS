#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cybersecurity-secrets-management",
  "displayName": "Secrets Management",
  "category": "Cybersecurity",
  "categoryId": "cybersecurity",
  "sourceText": "Secrets Management",
  "sourcePath": "./plugins/seis-topics/seis-topic-cybersecurity-secrets-management"
});
