#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-eleni-neferi-media-pipeline",
  "displayName": "Media Pipeline",
  "category": "ELENI-NEFERI",
  "categoryId": "eleni-neferi",
  "sourceText": "Media Pipeline",
  "sourcePath": "./plugins/seis-topics/seis-topic-eleni-neferi-media-pipeline"
});
