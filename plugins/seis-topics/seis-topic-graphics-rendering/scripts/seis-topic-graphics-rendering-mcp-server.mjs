#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-graphics-rendering",
  "displayName": "Rendering",
  "category": "Graphics",
  "categoryId": "graphics",
  "sourceText": "Rendering",
  "sourcePath": "./plugins/seis-topics/seis-topic-graphics-rendering"
});
