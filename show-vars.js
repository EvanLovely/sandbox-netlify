#!/usr/bin/env node
console.log('Showing all Environmental Vars that start with "TRAVIS": ');
var envVars = process.env;

Object.keys(envVars).forEach(key => {
  if (key.startsWith('TRAVIS')) {
    console.log(`${key}: ${envVars[key]}`);
  }
});

console.log('Done showing env vars');
