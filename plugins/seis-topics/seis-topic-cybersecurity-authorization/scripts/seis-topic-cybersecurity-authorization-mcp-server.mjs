#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cybersecurity-authorization",
  "displayName": "Authorization",
  "category": "Cybersecurity",
  "categoryId": "cybersecurity",
  "sourceText": "Authorization",
  "sourcePath": "./plugins/seis-topics/seis-topic-cybersecurity-authorization"
});
