#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-knowledge-vr",
  "displayName": "VR",
  "category": "Knowledge",
  "categoryId": "knowledge",
  "sourceText": "VR",
  "sourcePath": "./plugins/seis-topics/seis-topic-knowledge-vr"
});
