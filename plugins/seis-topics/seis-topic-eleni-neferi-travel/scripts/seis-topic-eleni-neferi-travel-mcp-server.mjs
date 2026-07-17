#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-eleni-neferi-travel",
  "displayName": "Travel",
  "category": "ELENI-NEFERI",
  "categoryId": "eleni-neferi",
  "sourceText": "Travel",
  "sourcePath": "./plugins/seis-topics/seis-topic-eleni-neferi-travel"
});
