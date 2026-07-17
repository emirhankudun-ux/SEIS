#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cybersecurity-compliance",
  "displayName": "Compliance",
  "category": "Cybersecurity",
  "categoryId": "cybersecurity",
  "sourceText": "Compliance",
  "sourcePath": "./plugins/seis-topics/seis-topic-cybersecurity-compliance"
});
