---
title: 'Trusting Git Tags in Github Workflows'
date: '2025-08-17'
---

When you are building are you building Github workflows it is common for you to rely on multiple actions to achieve your build. A common action you may use is the `actions/checkout` action, which checks out your repository so your workflow can access it.

```yaml
name: Build something
on: push

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build

      - uses: actions/upload-artifact@v3
        with:
          name: build-output
```

We can trust this, right? Well, not exactly. Git tags can be manipulated and reassigned at any point, and the contents of the repository at a given tag may not be what you expect. At one point v5 of actions/checkout may do what is expected but tomorrow that may not be the case, this is because Git tags are mutable by nature.

## So how do we handle this?

One approach is to use a specific commit SHA instead of a tag. Every commit that is made in a Git repository is assigned a unique SHA-1 hash. This hash can be used in your Github action workflow to gurantee you are retrieving the workflows code from a point of time that you trust.

An example of this is shown below:


```yaml
name: Build something
on: push

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@08c6903cd8c0fde910a37f88322edcfb5dd907a8 # v5.0.0

      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build

      - uses: actions/upload-artifact@v3
        with:
          name: build-output
```

We have updated our workflow to use commit hash from the v5.0.0 release, now if we need to reproduce this build in the future, we can be confident that we are using the exact same code that was present at that point in time. This eliminates the uncertainty that comes with using mutable Git tags and provides a more reliable and reproducible build process.

## But why should we care about this?

Just a few months back a popular Github action [tj-actions/changed-files](https://github.com/tj-actions/changed-files) was compromised with a payload that attempted to exfiltrate secrets from the repository. This situation can be entirely avoided downstream by targeting the specific commit SHA rather than trusting a mutable tag.

## What are Github doing?

Github are working towards improving security across the platform by allowing you to configure your repository to [only use SHAs in your Github action workflow](https://github.blog/changelog/2025-08-15-github-actions-policy-now-supports-blocking-and-sha-pinning-actions/) as well as working on a feature for '[immutable releases](https://github.com/github/roadmap/issues/1137)' which will make it easier to do the right thing by default.


