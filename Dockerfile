# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/aspnet:5.0
COPY UserPerformance/bin/Release/net5.0/publish app/
WORKDIR /app
ENTRYPOINT ["dotnet", "UserPerformance.dll"]