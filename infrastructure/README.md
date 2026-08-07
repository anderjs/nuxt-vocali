# Terraform base configuration

This folder contains a minimal Terraform setup for the project.

## Files

- `main.tf`: main Terraform configuration
- `variables.tf`: input variables
- `outputs.tf`: outputs
- `terraform.tfvars.example`: example values

## Usage

```bash
terraform init
cp terraform.tfvars.example terraform.tfvars
terraform plan
```

## Gitignore notes

- `.terraform/` should not be committed
- `.terraform.lock.hcl` should be committed
