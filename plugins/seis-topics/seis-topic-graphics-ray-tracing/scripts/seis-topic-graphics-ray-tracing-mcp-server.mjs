#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-graphics-ray-tracing",
  "displayName": "Ray Tracing",
  "category": "Graphics",
  "categoryId": "graphics",
  "sourceText": "Ray Tracing",
  "sourcePath": "./plugins/seis-topics/seis-topic-graphics-ray-tracing"
});
