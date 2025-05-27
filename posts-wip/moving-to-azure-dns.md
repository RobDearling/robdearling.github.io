---
title: 'Moving to Azure DNS'
date: '2025-05-27'
---

Recently I switched this website's DNS from Cloudflare to Azure It's not that there's anything wrong with Cloudflare, but I wanted to try out different technology options. Since I'm already working with Azure, it makes sense to use it for this site to learn more about it and experiment.

## The current setup

The current setup for this website's DNS is relatively simple. The website is currently running on Github Pages and the only DNS records set are those for Github pages.

| Type     | Name              | Value                 |
| -------- | ----------------- | --------------------- |
| A        | wreckitrob.dev    | 185.199.108.153       |
| A        | wreckitrob.dev    | 185.199.108.153       |
| A        | wreckitrob.dev    | 185.199.108.153       |
| CNAME    | www               | robdearling.github.io |

These records will need to be moved over to Azure DNS to keep the website running.

## Creating the DNS Zone in Azure

First, we will need to create a DNS Zone in Azure. Azure offers two types of DNS Zones: public and private. For this website, we'll be using a public DNS Zone to manage its DNS records.

An Azure DNS zone is a collection of DNS settings for a single domain within Azure. Within the zone, there are groups of records named recordsets, each recordset can contain 0-n individual records.

