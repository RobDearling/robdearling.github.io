---
title: 'Where does a request go with an Azure Private Endpoint?'
date: '2026-11-24'
summary: 'Follow one Blob Storage request through DNS and HTTPS, then unlink the private DNS zone and predict where the next request will land.'
---

An application uploads a blob to `fieldnotes.blob.core.windows.net`. You give the storage account a private endpoint. The connection string stays exactly the same. So what makes the next upload take a different path?

Follow two exchanges. First the client asks DNS for an address. Then it opens an HTTPS connection to that address. In the diagrams, dashed lines carry DNS messages and solid lines carry the storage request.

## Start with the public address

Send the request from a laptop on the internet. Then try it from a VM inside Azure. Both clients receive a public address. Watch the solid line when you change clients. With Azure's default routing, a VM reaches an Azure service's public IP over Microsoft's backbone. The laptop reaches the public endpoint over the internet. [Azure virtual network routing](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-udr-overview#default-routes)

```explainer
azure-private-endpoints/public-endpoint
```

## Give Blob Storage an address inside the network

Create an approved private endpoint for the storage account's **blob** service. Azure gives that endpoint a network interface in your subnet. In this example its address is `10.42.1.5`. The storage service still sits outside the virtual network.

Now link the private DNS zone `privatelink.blob.core.windows.net` to the VM's virtual network. The ordinary Blob hostname has a CNAME pointing to `fieldnotes.privatelink.blob.core.windows.net`. In the linked zone, that name has an A record for `10.42.1.5`. Step through the DNS reply and watch which machine starts the HTTPS connection. [Azure Storage private endpoint DNS](https://learn.microsoft.com/en-us/azure/storage/common/storage-private-endpoints#dns-changes-for-private-endpoints)

```explainer
azure-private-endpoints/private-dns
```

## Predict the next destination

Leave the private endpoint in place and unlink the DNS zone. What address will the VM receive on its next fresh lookup? Make a prediction, then step forward. Try linking the zone again and sending the same request from the laptop.

```explainer
azure-private-endpoints/experiment
```

The laptop uses public DNS and has no private connection to the VNet. The VM uses Azure-provided DNS, default routes, and working outbound connectivity. Each run starts with an empty DNS cache. Public network access stays enabled and both clients have permission to upload, so each path can finish.

Creating a private endpoint gives Blob Storage a private way in. Public network access has its own setting. If you disable it, a client can still receive a public DNS answer and have its storage request denied. When diagnosing an upload, check the address the client received, the route to that address, and the service's access settings. [Azure Storage private endpoints](https://learn.microsoft.com/en-us/azure/storage/common/storage-private-endpoints)
