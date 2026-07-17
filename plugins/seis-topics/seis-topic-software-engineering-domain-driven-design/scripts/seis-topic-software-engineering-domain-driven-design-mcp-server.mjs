#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-domain-driven-design",
  "displayName": "Domain-Driven Design",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Domain-Driven Design",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-domain-driven-design"
});
