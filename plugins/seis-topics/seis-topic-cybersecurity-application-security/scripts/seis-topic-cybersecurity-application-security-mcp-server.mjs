#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cybersecurity-application-security",
  "displayName": "Application Security",
  "category": "Cybersecurity",
  "categoryId": "cybersecurity",
  "sourceText": "Application Security",
  "sourcePath": "./plugins/seis-topics/seis-topic-cybersecurity-application-security"
});
