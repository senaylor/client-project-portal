# Azure Deployment Plan

## Goal

Deploy Client Project Portal to Azure using container-based infrastructure.

The production target is:

- React frontend as a static Nginx container
- Laravel API as a single container running Nginx + PHP-FPM
- Azure Database for PostgreSQL Flexible Server
- Azure Container Registry for storing Docker images
- Azure Container Apps for running the frontend and API containers

Azure Container Apps is suitable here because it runs containerized applications without requiring us to manage orchestration infrastructure. Azure Container Registry will store the built API and web images. Azure Database for PostgreSQL Flexible Server will provide the managed production PostgreSQL database.

## Target Azure resources

### Resource group

## Deployed Azure Resources

The 1st manual Azure deployment has been completed successfully

Suggested name:

```txt 
rg-client-project-portal-dev

Container Registry:
cppregistry74

PostgreSQL Flexible Server:
psql-cpp-dev-8054

Container Apps Environment:
cae-client-project-portal-dev

API Container App:
ca-client-project-portal-api-dev

Port:
8080

Web Container App:
ca-client-project-portal-web-dev

Port:
80

API Health endpoint:
https://ca-client-project-portal-api-dev.blueocean-8b176a9e.australiaeast.azurecontainerapps.io/api/health

Frontend URL:
https://ca-client-project-portal-web-dev.blueocean-8b176a9e.australiaeast.azurecontainerapps.io

Postgres Host:
psql-cpp-dev-8054.postgres.database.azure.com

Postgres PW:
G*******Y