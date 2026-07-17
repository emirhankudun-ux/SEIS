#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-graphics-layout",
  "displayName": "Layout",
  "category": "Graphics",
  "categoryId": "graphics",
  "sourceText": "Layout",
  "sourcePath": "./plugins/seis-topics/seis-topic-graphics-layout"
});
