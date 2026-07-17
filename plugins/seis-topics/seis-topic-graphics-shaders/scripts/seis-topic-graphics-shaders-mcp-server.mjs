#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-graphics-shaders",
  "displayName": "Shaders",
  "category": "Graphics",
  "categoryId": "graphics",
  "sourceText": "Shaders",
  "sourcePath": "./plugins/seis-topics/seis-topic-graphics-shaders"
});
