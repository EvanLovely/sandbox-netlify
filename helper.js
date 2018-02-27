#!/usr/bin/env node
const url = require('url');
const path = require('path');
const querystring = require('querystring');
const fetch = require("node-fetch");
const netlifyBase = 'https://api.netlify.com/api/v1';
const netlifySiteId = 'sandbox-netlify.netlify.com';
const netlifyDeploysEndpoint = `${netlifyBase}/sites/${netlifySiteId}/deploys`;

const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
// const TRAVIS_PULL_REQUEST = '1';
const TRAVIS_PULL_REQUEST = process.env.TRAVIS_PULL_REQUEST;
// const TRAVIS_REPO_SLUG = 'EvanLovely/sandbox-netlify';
const TRAVIS_REPO_SLUG = process.env.TRAVIS_REPO_SLUG;
// TRAVIS_PULL_REQUEST_BRANCH: 'EvanLovely-patch-1',

if (!NETLIFY_TOKEN) {
  console.log('Need to have env var of NETLIFY_TOKEN set');
  process.exit(1);
}

if (TRAVIS_PULL_REQUEST == 'false') {
  console.log('Not a PR build, so this is not needed.');
  process.exit(0);
}


async function getStuff(urlEndpoint, paramSets = []) {
  console.log(`Hitting: ${urlEndpoint}`);
  try {
    const data = await fetch(urlEndpoint).then(res => res.json());
    // console.log(data);
    return data;
  } catch (error) {
    console.error(error);
  }
}

const params = {
  access_token: NETLIFY_TOKEN,
};

async function init() {
  const netlifyDeploys = await getStuff(url.resolve(netlifyDeploysEndpoint, `?${querystring.stringify(params)}`));
  if (!netlifyDeploys) {
    console.error('Did not get any info on latest Netlify deploys...');
    process.exit(1);
  }
  // console.log('Latest Netlify Deploy: ', netlifyDeploys[0]);

  const githubCommentText = `Netlify build preview available at: ${netlifyDeploys[0].deploy_ssl_url}`;
  const githubCommentEndpoint = `https://api.github.com/repos/${TRAVIS_REPO_SLUG}/issues/${TRAVIS_PULL_REQUEST}/comments`;
  console.log('Posting to: ', githubCommentEndpoint);
  try {
    const response = await fetch(githubCommentEndpoint, {
      method: 'POST',
      body: JSON.stringify({
        body: githubCommentText,
      }),
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
    }).then(res => res.json());
    console.log(response);
    // .then(json => console.log(json));
    console.log('GitHub comment posted');
  } catch (error) {
    console.log('Error');
    console.error(error);
  }
}

init();
