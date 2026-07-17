#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cybersecurity-authentication",
  "displayName": "Authentication",
  "category": "Cybersecurity",
  "categoryId": "cybersecurity",
  "sourceText": "Authentication",
  "sourcePath": "./plugins/seis-topics/seis-topic-cybersecurity-authentication"
});
