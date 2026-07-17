#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-graphics-path-tracing",
  "displayName": "Path Tracing",
  "category": "Graphics",
  "categoryId": "graphics",
  "sourceText": "Path Tracing",
  "sourcePath": "./plugins/seis-topics/seis-topic-graphics-path-tracing"
});
