#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-creative-production-cgi",
  "displayName": "CGI",
  "category": "Creative Production",
  "categoryId": "creative-production",
  "sourceText": "CGI",
  "sourcePath": "./plugins/seis-topics/seis-topic-creative-production-cgi"
});
