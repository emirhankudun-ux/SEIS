#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cybersecurity-risk-management",
  "displayName": "Risk Management",
  "category": "Cybersecurity",
  "categoryId": "cybersecurity",
  "sourceText": "Risk Management",
  "sourcePath": "./plugins/seis-topics/seis-topic-cybersecurity-risk-management"
});
