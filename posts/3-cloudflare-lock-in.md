---
title: 'Cloudflare DNS Lock-In'
date: '2025-05-27'
headerImage: '/images/cloudlock.jpg'
summary: 'Discovering the limitations of registering domains with Cloudflare when trying to move DNS management elsewhere. Once your domain is registered with Cloudflare, you cannot change nameservers to other providers like AWS, Azure, or Google Cloud.'
---

I’ve recently begun thinking about switching this website’s DNS to Azure DNS zones as a way to try out new technology. Right now, the website’s domain name is registered with Cloudflare, and Cloudflare also handles its DNS settings. The same is true for my other domains.

While I was working on a blog post and figuring out how to make the switch, I quickly realized that I couldn’t move my DNS management to Azure DNS zones unless I also moved my domain registration away from Cloudflare. 😵‍💫

## The issue: Lock-In

Cloudflare offers domain registration at base cost, probably to encourage people to use more of their services and stay within their ecosystem. That’s convenient until you want to move elsewhere.

I chose to register all my domains with Cloudflare because they’re a reputable, privacy-focused company, and their services are easy to use and integrate. But the friction starts once you want to move outside of their ecosystem. Once your domain is registered with Cloudflare, you can’t change the nameservers to another provider. This means I can’t switch my DNS hosting to other popular cloud services like AWS, Azure, or Google Cloud. For most typical DNS setups this is fine, you may just need to change a few records but in my case I want to move my entire DNS management elsewhere.

## What Are My Options?

Honestly, I’m not entirely sure yet. I like having everything managed in one place to keep things simple. But I also want to experiment and try new things.  

Right now, I see two possibilities:  

- Move my current domain to a different domain registrar that doesn’t lock me in  
- Or register a new domain elsewhere that I can easily manage and experiment with  

At the moment, I lean toward getting a new, probably temporary (throwaway) domain just for testing, rather than trying to reconfigure my existing domains.
