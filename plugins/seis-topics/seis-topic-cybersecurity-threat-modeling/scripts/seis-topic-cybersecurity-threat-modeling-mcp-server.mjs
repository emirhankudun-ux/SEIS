#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cybersecurity-threat-modeling",
  "displayName": "Threat Modeling",
  "category": "Cybersecurity",
  "categoryId": "cybersecurity",
  "sourceText": "Threat Modeling",
  "sourcePath": "./plugins/seis-topics/seis-topic-cybersecurity-threat-modeling"
});
