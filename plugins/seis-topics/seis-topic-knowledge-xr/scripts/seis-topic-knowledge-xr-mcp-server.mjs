#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-knowledge-xr",
  "displayName": "XR",
  "category": "Knowledge",
  "categoryId": "knowledge",
  "sourceText": "XR",
  "sourcePath": "./plugins/seis-topics/seis-topic-knowledge-xr"
});
