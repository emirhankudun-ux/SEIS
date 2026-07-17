#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cybersecurity-ai-security",
  "displayName": "AI Security",
  "category": "Cybersecurity",
  "categoryId": "cybersecurity",
  "sourceText": "AI Security",
  "sourcePath": "./plugins/seis-topics/seis-topic-cybersecurity-ai-security"
});
