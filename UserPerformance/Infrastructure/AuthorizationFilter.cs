using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Configuration;
using System;
using System.Linq;
using System.Security.Claims;

namespace UserPerformanceApp.Infrastructure
{
    public class AuthorizationFilter : Attribute, IAuthorizationFilter
    {
        private readonly IConfiguration _configuration;

        public AuthorizationFilter(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            using (var ctx = new AppDbContext(_configuration))
            {
                Guid? userId = ctx.Users.Where(u => u.Login == context.HttpContext.User.Identity.Name.ToUpper()).SingleOrDefault()?.Id;

                if (null == userId)
                {
                    // User is not authorized
                    context.Result = new StatusCodeResult(StatusCodes.Status403Forbidden);
                }
                else
                {
                    context.HttpContext.User.AddIdentity(new ClaimsIdentity(
                        new Claim[] {
                            new Claim(ClaimTypes.NameIdentifier, userId.ToString())
                        }));
                }
            }
        }
    }
}