# UserPerformance
Example of an asp.net core mvc 5.0 web application with frontend based on React framework and @material-ui/core components.
The solution also contains Electron JS desktop application that can be used as a frontend.

It is available for playing by url https://user-performance-fcn7f4ebeq-uc.a.run.app/

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
