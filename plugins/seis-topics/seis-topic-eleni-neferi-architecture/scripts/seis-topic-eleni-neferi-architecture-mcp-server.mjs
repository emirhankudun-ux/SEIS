#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-eleni-neferi-architecture",
  "displayName": "Architecture",
  "category": "ELENI-NEFERI",
  "categoryId": "eleni-neferi",
  "sourceText": "Architecture",
  "sourcePath": "./plugins/seis-topics/seis-topic-eleni-neferi-architecture"
});
