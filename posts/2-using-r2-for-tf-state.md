---
title: 'Using Cloudflare R2 as a Terraform backend'
date: '2024-12-09'
headerImage: '/images/r2.jpg'
summary: 'A practical guide to setting up Cloudflare R2 as a Terraform backend. Covering bucket creation, API token configuration, and leveraging R2s S3-compatible storage for remote state management.'
---

When creating this website, I decided to work with a tech stack that I'm not familiar with(Within certain boundaries). Typically, while working with Terraform I work with AWS or Azure. This time I chose to work with Cloudflare.

Cloudflare offers S3-Compatible object. This allows us to use an R2 storage as a Terraform backend with relative ease.

## Creating an R2 Bucket

To create an R2 Storage bucket you can either use the [Cloudflare Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) like so:

```sh
wrangler r2 bucket create <YOUR_BUCKET_NAME>
```

Alternatively, you can create an R2 storage account via the [Cloudflare Account Dashboard](https://dash.cloudflare.com/?to=/:account/r2/new) user interface.

When you create a R2 Storage bucket you will be presented with an S3 API value. Keep this for the next steps.

## Creating Cloudflare API Keys scoped to the bucket

Now, you need to create API keys to communicate with the bucket from Terraform:

- In Account Home, select R2
- Under Account details, select Manage R2 API tokens
- Select Create API token.
- Under permissions, select **Object Read and Write** permissions and then select the scope to be scoped to your newly created R2 bucket.

You will now have a API token that is scoped to your R2 storage bucket to use with Terraform.

## Setting up Terraform

Firstly, configure the [Cloudflare Terraform Provider](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs). The official documentation shows you that the provider can be configured by passing a value to `api_token` in the provider block; however, I would recommend using the environment variable `CLOUDFLARE_API_KEY`.

```hcl
provider "cloudflare" {
  # Configured by the CLOUDFLARE_API_KEY environment variable
}
```

Next, configure your Terraform backend as `s3` as the R2 Storage bucket is S3-Compatible.

```hcl
terraform {
  backend "s3" {
    bucket                      = "wreckitrobtf"
    key                         = "terraform.tfstate"
    region                      = "auto"
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    skip_s3_checksum            = true
    use_path_style              = true
    skip_requesting_account_id  = true
  }
}
```

Key points:

- Set `region` to `auto` 
- Set your `bucket` value to the name of the bucket you created

Configure the following envrionment variables as you would with an AWS S3 Bucket:

- `AWS_ENDPOINT_URL_S3` -> The S3 API value provided when creating your R2 Storage bucket
- `AWS_ACCESS_KEY_ID` -> Your Cloudflare Account ID
- `AWS_SECRET_KEY` ->  The API token you created that is scoped to your R2 Storage bucket

## Next Steps

If you have some existing state that you would like to migrate to the backend run the `terraform init -reconfigure` command. Otherwise, simply run `terraform init` and you're all set.
