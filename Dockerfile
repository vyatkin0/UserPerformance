#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:5.0.3-buster-slim AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
RUN curl -sL https://deb.nodesource.com/setup_10.x |  bash -
RUN apt-get install -y nodejs
WORKDIR /src
COPY ["UserPerformance/UserPerformance.csproj", "UserPerformance/"]
RUN dotnet restore "UserPerformance/UserPerformance.csproj"
COPY . .
WORKDIR "/src/UserPerformance"
RUN dotnet build "UserPerformance.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "UserPerformance.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "UserPerformance.dll"]