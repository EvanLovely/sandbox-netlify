#!/usr/bin/env node

var envVars = process.env;
delete envVars.NETLIFY_TOKEN;
console.log(envVars);
