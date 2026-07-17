#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-graphics-materials",
  "displayName": "Materials",
  "category": "Graphics",
  "categoryId": "graphics",
  "sourceText": "Materials",
  "sourcePath": "./plugins/seis-topics/seis-topic-graphics-materials"
});
