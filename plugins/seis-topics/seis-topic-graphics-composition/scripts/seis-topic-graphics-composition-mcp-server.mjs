#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-graphics-composition",
  "displayName": "Composition",
  "category": "Graphics",
  "categoryId": "graphics",
  "sourceText": "Composition",
  "sourcePath": "./plugins/seis-topics/seis-topic-graphics-composition"
});
