# Terraform base configuration

This folder contains a minimal Terraform setup for the project.

## Files

- `main.tf`: AWS provider plus existing base S3/DynamoDB resources
- `api-gateway.tf`: HTTP API Gateway, Cognito JWT authorizer, Lambda routes
- `lambda.tf`: Lambda packaging/deployment resources
- `iam.tf`: Lambda execution role
- `cognito.tf`: Cognito Hosted UI/OAuth federation configuration for the existing User Pool/App Client
- `variables.tf`: input variables
- `outputs.tf`: outputs
- `terraform.tfvars.example`: example values

## Usage

```bash
terraform init
cp terraform.tfvars.example terraform.tfvars
terraform plan
```

Do not run `terraform apply` until the plan has been reviewed.

## Cognito Google federation

This configuration reuses the existing Cognito User Pool and imports the existing App Client into Terraform state so it can be updated in place for Hosted UI OAuth settings.

Required Cognito/Google values:

- `cognito_user_pool_id`: existing Cognito User Pool ID
- `cognito_user_pool_client_id`: existing Cognito App Client ID
- `cognito_user_pool_client_name`: existing Cognito App Client name; keep this equal to the current AWS value to avoid renaming it
- `cognito_domain_prefix`: globally unique Cognito managed-login domain prefix
- `google_client_id`: Google OAuth client ID
- `google_client_secret`: Google OAuth client secret; sensitive, never commit real values
- `speechmatics_api_key`: permanent Speechmatics API key used only by server-side Speechmatics Lambdas (realtime credentials and file processing); sensitive, never expose it to Nuxt
  public runtime configuration

Development redirect URLs:

- Callback: `http://localhost:3000/auth/callback`
- Logout: `http://localhost:3000/login`

Production URLs can be added later through `cognito_callback_urls` and `cognito_logout_urls`.

## Gitignore notes

- `.terraform/` should not be committed
- `.terraform.lock.hcl` should be committed
- `terraform.tfvars` should not be committed when it contains real secrets
