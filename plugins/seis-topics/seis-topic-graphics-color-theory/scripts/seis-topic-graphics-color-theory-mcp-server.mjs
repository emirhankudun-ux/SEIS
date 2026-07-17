#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-graphics-color-theory",
  "displayName": "Color Theory",
  "category": "Graphics",
  "categoryId": "graphics",
  "sourceText": "Color Theory",
  "sourcePath": "./plugins/seis-topics/seis-topic-graphics-color-theory"
});
