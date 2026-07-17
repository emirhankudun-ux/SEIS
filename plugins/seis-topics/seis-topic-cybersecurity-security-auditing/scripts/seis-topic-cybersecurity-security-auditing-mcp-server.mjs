#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cybersecurity-security-auditing",
  "displayName": "Security Auditing",
  "category": "Cybersecurity",
  "categoryId": "cybersecurity",
  "sourceText": "Security Auditing",
  "sourcePath": "./plugins/seis-topics/seis-topic-cybersecurity-security-auditing"
});
