#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cybersecurity-incident-response",
  "displayName": "Incident Response",
  "category": "Cybersecurity",
  "categoryId": "cybersecurity",
  "sourceText": "Incident Response",
  "sourcePath": "./plugins/seis-topics/seis-topic-cybersecurity-incident-response"
});
