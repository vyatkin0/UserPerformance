using Microsoft.AspNetCore.Authentication.Negotiate;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using UserPerformanceApp.Infrastructure;

namespace EmployeePerformance
{
    public class Startup
    {
        private const string _appOrigins = "appOrigins";

        public Startup(IConfiguration configuration, IWebHostEnvironment environment)
        {
            Configuration = configuration;
            Environment = environment;
        }

        public IConfiguration Configuration { get; }
        IWebHostEnvironment Environment { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            if (IsDevEnv())
            {
                services.AddCors(options => options.AddPolicy(_appOrigins,
                    builder =>
                    {
                        builder.SetIsOriginAllowed(_=>true)
                            .AllowAnyMethod()
                            .AllowAnyHeader()
                            .AllowCredentials();
                            /*.WithExposedHeaders(HeaderNames.ContentDisposition)*/;
                    }));
            }
            /*
            else
            {
                services.AddCors(options => options.AddPolicy(_appOrigins,
                builder =>
                {
                    builder.WithOrigins("http://*.corp.com", "https://*.corp.com")
                        .SetIsOriginAllowedToAllowWildcardSubdomains()
                        .WithMethods(HttpMethod.Get.Method, HttpMethod.Post.Method)
                        .AllowAnyHeader()
                        .AllowCredentials()
                        .WithExposedHeaders(HeaderNames.ContentDisposition);
                }));
            }
            */

            services.AddAuthentication(NegotiateDefaults.AuthenticationScheme)
                .AddNegotiate();

            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

            /*
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(Configuration.GetConnectionString("UserPerformance"))
                //.UseLoggerFactory(_loggerFactory)
                );
            */

            services.AddScoped(provider => new AppDbContext(Configuration));

            services.Configure<IISServerOptions>(options =>
            {
                options.AutomaticAuthentication = false;
            });

            services.AddControllersWithViews();

            // In production, the React files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/build";
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (IsDevEnv())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();

            app.UseRouting();

            app.UseAuthentication();

            app.UseAuthorization();

            if (IsDevEnv())
            {
                app.UseCors(_appOrigins);
            }

            /*
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
            */

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    spa.UseReactDevelopmentServer(npmScript: "start");
                }
            });
        }

        private bool IsDevEnv() => Environment.IsDevelopment() || Environment.IsEnvironment("dev");
    }
}
