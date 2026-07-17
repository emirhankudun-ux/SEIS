#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-eleni-neferi-identity-bible",
  "displayName": "Identity Bible",
  "category": "ELENI-NEFERI",
  "categoryId": "eleni-neferi",
  "sourceText": "Identity Bible",
  "sourcePath": "./plugins/seis-topics/seis-topic-eleni-neferi-identity-bible"
});
