#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-eleni-neferi-moodboard-system",
  "displayName": "Moodboard System",
  "category": "ELENI-NEFERI",
  "categoryId": "eleni-neferi",
  "sourceText": "Moodboard System",
  "sourcePath": "./plugins/seis-topics/seis-topic-eleni-neferi-moodboard-system"
});
