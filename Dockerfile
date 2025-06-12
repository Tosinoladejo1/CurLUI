# Use official ASP.NET runtime image for final app
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80

# Use .NET SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy only the .csproj and restore
COPY Backend/ApiIntegrationUtility.csproj ./
RUN dotnet restore

# Copy everything else and build
COPY Backend/. ./
RUN dotnet publish -c Release -o /app/publish

# Final runtime image
FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ApiIntegrationUtility.dll"]
