#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cybersecurity-identity-management",
  "displayName": "Identity Management",
  "category": "Cybersecurity",
  "categoryId": "cybersecurity",
  "sourceText": "Identity Management",
  "sourcePath": "./plugins/seis-topics/seis-topic-cybersecurity-identity-management"
});
