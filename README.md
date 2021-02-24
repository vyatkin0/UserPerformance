# UserPerformance
Example of a web application that is based on asp.net mvc core 5.0 and React framework with @material-ui/core components.
The solution also contains Electron JS desktop application that can be used as a frontend.
MSSQL Server used as a data storage.

These are generic installation instructions.

Edit database connection string in file appsettings.json;
Download and install .NET SDK 5.0;
In the solution's folder execute following commands: "dotnet restore", "dotnet ef migrations add Initial", "dotnet ef database update", "dotnet build";
In the solution's folder execute "dotnet run" command.

Application is running now on a local web-server with url https://localhost:5001
