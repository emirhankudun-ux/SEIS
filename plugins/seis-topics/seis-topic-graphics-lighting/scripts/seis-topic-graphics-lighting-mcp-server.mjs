#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-graphics-lighting",
  "displayName": "Lighting",
  "category": "Graphics",
  "categoryId": "graphics",
  "sourceText": "Lighting",
  "sourcePath": "./plugins/seis-topics/seis-topic-graphics-lighting"
});
