# Vocali

Vocali es una aplicación Nuxt 4 respaldada por Cognito, API Gateway, Lambda,
DynamoDB, S3 y Speechmatics.

## Arquitectura

```text
Nuxt + Cognito
      ↓
API Gateway → Lambda → DynamoDB / S3 / Speechmatics

Nuxt ── WebSocket con credencial temporal ──> Speechmatics (tiempo real)
```

Los archivos de audio se suben directamente a S3 mediante URLs prefirmadas; no
pasan por Lambda.

## Requisitos previos

- Node.js 20 o superior
- npm
- Terraform 1.5 o superior
- AWS CLI autenticado mediante la cadena habitual de proveedores de credenciales de AWS
- Un User Pool y App Client de Cognito existentes
- Credenciales de cliente OAuth de Google y una API key de Speechmatics para Terraform

## Desarrollo local

```bash
cp .env.example .env
npm ci
npm run dev
```

Mantén los valores reales únicamente en `.env` e
`infrastructure/terraform.tfvars`; ambos están ignorados por Git. El navegador
solo necesita la configuración `NUXT_PUBLIC_*`. Nunca añadas credenciales de
AWS, secretos de cliente de Google ni `SPEECHMATICS_API_KEY` a la configuración
pública de ejecución.

## Verificaciones de calidad

```bash
npm run typecheck
npm run typecheck:lambda
npm run test
npm run e2e:run
npm run build:lambdas
npm run build

terraform -chdir=infrastructure fmt -check
terraform -chdir=infrastructure init
terraform -chdir=infrastructure validate
terraform -chdir=infrastructure plan -out=tfplan
```

No hay un comando de lint configurado. CI ejecuta las verificaciones de tipos,
las suites de Jest, los E2E de Cypress y los builds. Los E2E usan configuración
pública de prueba y no realizan llamadas reales a AWS ni Speechmatics.

## Despliegue

El frontend se genera como salida estática de Nuxt y se sirve desde un bucket
S3 privado dedicado a través de CloudFront. El bucket de audio/transcripciones
permanece privado y nunca se usa para alojar el frontend. CloudFront devuelve
`200.html` en las rutas no encontradas para que funcionen rutas del cliente como
`/transcriptions/:id` sin provocar redirecciones circulares.

### 1. Configurar Terraform

```bash
cp infrastructure/terraform.tfvars.example infrastructure/terraform.tfvars
```

Define estos valores en `infrastructure/terraform.tfvars`:

- `frontend_bucket_name`: bucket globalmente único para el frontend generado;
  debe ser distinto de `bucket_name`.
- `cognito_user_pool_id`, `cognito_user_pool_client_id` y
  `cognito_user_pool_client_name`: recursos Cognito existentes.
- `cognito_domain_prefix`: prefijo existente del inicio de sesión administrado
  de Cognito.
- `google_client_id` y `google_client_secret`.
- `speechmatics_api_key`.

Conserva las URLs de localhost en `cognito_callback_urls` y
`cognito_logout_urls`. Terraform añade automáticamente las URLs de producción
de CloudFront:

```text
https://<dominio-cloudfront>/auth/callback
https://<dominio-cloudfront>/login
```

Compila los bundles de Lambda antes de planificar Terraform:

```bash
npm ci
npm run build:lambdas
terraform -chdir=infrastructure init
terraform -chdir=infrastructure fmt -check
terraform -chdir=infrastructure validate
terraform -chdir=infrastructure plan -out=tfplan
```

```bash
terraform -chdir=infrastructure apply tfplan
```

### 2. Generar y publicar el frontend

Después de finalizar Terraform, exporta la configuración pública no secreta de
build:

```bash
export NUXT_PUBLIC_API_BASE_URL="$(terraform -chdir=infrastructure output -raw api_gateway_endpoint)"
export NUXT_PUBLIC_COGNITO_USER_POOL_ID="$(terraform -chdir=infrastructure output -raw cognito_user_pool_id)"
export NUXT_PUBLIC_COGNITO_CLIENT_ID="$(terraform -chdir=infrastructure output -raw cognito_user_pool_client_id)"
export NUXT_PUBLIC_COGNITO_DOMAIN="$(terraform -chdir=infrastructure output -raw cognito_managed_login_host)"
export NUXT_PUBLIC_COGNITO_REDIRECT_URI="$(terraform -chdir=infrastructure output -raw frontend_url)/auth/callback"
export NUXT_PUBLIC_COGNITO_LOGOUT_REDIRECT_URI="$(terraform -chdir=infrastructure output -raw frontend_url)/login"

npm run generate
aws s3 sync .output/public "s3://$(terraform -chdir=infrastructure output -raw frontend_bucket_name)" --delete
aws cloudfront create-invalidation \
  --distribution-id "$(terraform -chdir=infrastructure output -raw frontend_distribution_id)" \
  --paths '/*'
```

Obtén la URL de producción con:

```bash
terraform -chdir=infrastructure output -raw frontend_url
```

### Paso manual de Google OAuth

En Google Cloud Console, añade esta **URI de redirección autorizada** al mismo
cliente OAuth utilizado por Cognito:

```bash
terraform -chdir=infrastructure output -raw google_oauth_authorized_redirect_uri
```

Es la URL de Cognito `/oauth2/idpresponse`, no la URL de CloudFront. No
incluyas el secreto del cliente de Google en Nuxt ni en ninguna variable de
entorno pública.
