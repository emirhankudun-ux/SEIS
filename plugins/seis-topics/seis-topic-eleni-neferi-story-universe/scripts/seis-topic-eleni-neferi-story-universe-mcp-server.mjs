#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-eleni-neferi-story-universe",
  "displayName": "Story Universe",
  "category": "ELENI-NEFERI",
  "categoryId": "eleni-neferi",
  "sourceText": "Story Universe",
  "sourcePath": "./plugins/seis-topics/seis-topic-eleni-neferi-story-universe"
});
