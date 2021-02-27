# UserPerformance
Example of a web application that is based on asp.net mvc core 5.0 and React framework with @material-ui/core components.
The solution also contains Electron JS desktop application that can be used as a frontend.
MSSQL Server used as a data storage.

These are generic installation instructions.

Edit database connection string in file appsettings.json;

Download and install ASP.NET Core SDK 5.0;

In the solution's folder execute following commands:

`dotnet restore`

`dotnet tool install --global dotnet-ef`

`dotnet ef migrations add Initial --project UserPerformance`

`dotnet ef database update --project UserPerformance`

`dotnet build`

`dotnet test`


In the solution's folder execute `dotnet run` command.

Application is running now on a local web-server with url https://localhost:5001

These are an Electron client building instructions.

In the solution's folder execute following commands:

`cd ./UserPerformance/ClientApp`

`Specify the backend url in config section of package.json "backendUrl": "https://localhost:5001/api/"`

`npm run build:electron`

`cd electron/`

`npm install`

`npm run start`

`or npm run make`


The installation package is in ./out folder.
