using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using TestPlatform.Application.Interfaces;
using TestPlatform.Application.Services;

namespace TestPlatform.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IExamService, ExamService>();
        services.AddScoped<IQuestionService, QuestionService>();
        services.AddScoped<IAttemptService, AttemptService>();
        services.AddScoped<IResultService, ResultService>();
        services.AddScoped<IAnalyticsService, AnalyticsService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ICategoryService, CategoryService>();

        return services;
    }
}
