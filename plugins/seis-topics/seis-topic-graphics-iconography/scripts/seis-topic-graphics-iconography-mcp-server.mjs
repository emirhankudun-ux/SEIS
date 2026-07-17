#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-graphics-iconography",
  "displayName": "Iconography",
  "category": "Graphics",
  "categoryId": "graphics",
  "sourceText": "Iconography",
  "sourcePath": "./plugins/seis-topics/seis-topic-graphics-iconography"
});
