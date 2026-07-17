#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-graphics-graphics-engine",
  "displayName": "Graphics Engine",
  "category": "Graphics",
  "categoryId": "graphics",
  "sourceText": "Graphics Engine",
  "sourcePath": "./plugins/seis-topics/seis-topic-graphics-graphics-engine"
});
