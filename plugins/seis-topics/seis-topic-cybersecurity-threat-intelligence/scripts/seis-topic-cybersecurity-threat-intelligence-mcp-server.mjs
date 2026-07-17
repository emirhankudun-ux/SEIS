#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cybersecurity-threat-intelligence",
  "displayName": "Threat Intelligence",
  "category": "Cybersecurity",
  "categoryId": "cybersecurity",
  "sourceText": "Threat Intelligence",
  "sourcePath": "./plugins/seis-topics/seis-topic-cybersecurity-threat-intelligence"
});
