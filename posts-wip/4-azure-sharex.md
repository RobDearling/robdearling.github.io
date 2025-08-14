---
title: 'Azure Sharex'
date: '2025-05-27'
---

[Sharex](https://getsharex.com/) is a free open source screenshot tool for Windows. It offers the capability to take a screenshot and create a shareable URL of the screenshot. Sharex out of the box can upload images to services like Imgur, Dropbox and Amazon S3, which then give you simple links to share. However, these links are plain, boring and don't support Azure as a backend.

I want to create a custom URL such as **share.wreckitrob.dev** that makes sharing my images easier, using Azures storage services and DNS management instead of the usual options.

## The plan

Sharex offers a feature named [Custom Uploader](https://getsharex.com/docs/custom-uploader) that allows you to implement an API that allows for image uploads that is compatible with the Sharex client.

We will be using this feature to implement our custom image store for Sharex. The services we will be using are 

- Azure Storage Accounts
- Azure Function Apps
- Cloudflare DNS
- Terraform
- Go

The aim of the project is to have a working image sharing service that is secure and cheap to run.

## Setting up the storage account

Azure offers four different levels for storing your blob data:

- Hot tier: Best for data you access or change often. It costs less to access but more to store.
- Cool tier: Good for data you rarely look at or update. It costs less to store but more to access.
- Cold tier: Suitable for data you almost never access or change. It has very low storage costs but higher access costs.
- Archive tier: Ideal for data you won't need for a long time. It has the lowest storage costs but the highest costs to access.

In my case, I usually generate a link and share it with just two or three people who will look at it only once. I don’t plan to keep the images for more than two weeks, so the hot tier seems like the best choice for what I need.

We are going to be using Azure storages static site feature which serves contents via the $web container.


```hcl

```

## Implementing the Sharex API

We will be using Azure Function Apps to host our API for Sharex. The cost for Azure Function Apps scale down to 0 when not in use therefore we will only be paying for what we use here.

What we want to do

- Implement the Sharex API
- Allow the function app to upload blob data to the storage account
- Implement a key system to ensure only those with the key can upload images

