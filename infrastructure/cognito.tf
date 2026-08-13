locals {
  cognito_callback_urls = distinct(var.cognito_callback_urls)
  cognito_logout_urls   = distinct(var.cognito_logout_urls)
  google_oauth_scopes   = ["openid", "email", "profile"]
  cognito_oauth_scopes  = concat(local.google_oauth_scopes, ["aws.cognito.signin.user.admin"])
}

import {
  to = aws_cognito_user_pool_client.app_client
  id = "${var.cognito_user_pool_id}/${var.cognito_user_pool_client_id}"
}

import {
  to = aws_cognito_user_pool_domain.managed_login
  id = var.cognito_domain_prefix
}

import {
  to = aws_cognito_identity_provider.google
  id = "${var.cognito_user_pool_id}:Google"
}

resource "aws_cognito_user_pool_domain" "managed_login" {
  domain       = var.cognito_domain_prefix
  user_pool_id = data.aws_cognito_user_pool.app_pool.id
}

resource "aws_cognito_identity_provider" "google" {
  user_pool_id  = data.aws_cognito_user_pool.app_pool.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    client_id                     = var.google_client_id
    client_secret                 = var.google_client_secret
    authorize_scopes              = join(" ", local.google_oauth_scopes)
    authorize_url                 = "https://accounts.google.com/o/oauth2/v2/auth"
    token_url                     = "https://www.googleapis.com/oauth2/v4/token"
    token_request_method          = "POST"
    oidc_issuer                   = "https://accounts.google.com"
    attributes_url                = "https://people.googleapis.com/v1/people/me?personFields="
    attributes_url_add_attributes = "true"
  }

  attribute_mapping = var.google_attribute_mapping
}

resource "aws_cognito_user_pool_client" "app_client" {
  name         = var.cognito_user_pool_client_name
  user_pool_id = data.aws_cognito_user_pool.app_pool.id

  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = local.cognito_oauth_scopes
  callback_urls                        = local.cognito_callback_urls
  logout_urls                          = local.cognito_logout_urls
  supported_identity_providers         = ["COGNITO", aws_cognito_identity_provider.google.provider_name]

  depends_on = [aws_cognito_identity_provider.google]

  lifecycle {
    ignore_changes = [
      access_token_validity,
      auth_session_validity,
      enable_propagate_additional_user_context_data,
      enable_token_revocation,
      explicit_auth_flows,
      id_token_validity,
      prevent_user_existence_errors,
      read_attributes,
      refresh_token_validity,
      token_validity_units,
      write_attributes,
    ]
  }
}
