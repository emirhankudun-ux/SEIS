#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cybersecurity-network-security",
  "displayName": "Network Security",
  "category": "Cybersecurity",
  "categoryId": "cybersecurity",
  "sourceText": "Network Security",
  "sourcePath": "./plugins/seis-topics/seis-topic-cybersecurity-network-security"
});
