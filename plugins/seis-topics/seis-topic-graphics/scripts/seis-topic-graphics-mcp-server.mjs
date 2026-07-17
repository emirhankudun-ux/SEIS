#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-graphics",
  "displayName": "Graphics",
  "category": "Graphics",
  "categoryId": "graphics",
  "sourceText": "Graphics",
  "sourcePath": "./plugins/seis-topics/seis-topic-graphics"
});
