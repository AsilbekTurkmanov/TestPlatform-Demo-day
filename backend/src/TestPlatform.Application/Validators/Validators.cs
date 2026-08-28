using FluentValidation;
using TestPlatform.Application.DTOs.Auth;
using TestPlatform.Application.DTOs.Categories;
using TestPlatform.Application.DTOs.Exams;
using TestPlatform.Application.DTOs.Questions;

namespace TestPlatform.Application.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().WithMessage("Valid email is required.");
        RuleFor(x => x.Password).NotEmpty().WithMessage("Password is required.");
    }
}

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MinimumLength(2).MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(150);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6).WithMessage("Password must be at least 6 characters.");
        RuleFor(x => x.ConfirmPassword).Equal(x => x.Password).WithMessage("Passwords do not match.");
    }
}

public class CreateExamDtoValidator : AbstractValidator<CreateExamDto>
{
    public CreateExamDtoValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MinimumLength(3).MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.CategoryId).NotEmpty();
        RuleFor(x => x.DurationMinutes).InclusiveBetween(5, 360).WithMessage("Duration must be between 5 and 360 minutes.");
        RuleFor(x => x.PassingScore).InclusiveBetween(10, 100).WithMessage("Passing score must be between 10% and 100%.");
        RuleFor(x => x.MaxAttempts).InclusiveBetween(1, 20);
    }
}

public class CreateQuestionDtoValidator : AbstractValidator<CreateQuestionDto>
{
    public CreateQuestionDtoValidator()
    {
        RuleFor(x => x.Text).NotEmpty().MinimumLength(3);
        RuleFor(x => x.Points).InclusiveBetween(1, 100);
        RuleFor(x => x.Options).NotEmpty().WithMessage("Question must have at least 2 options.");
        RuleFor(x => x.Options).Must(options => options.Count >= 2).WithMessage("At least 2 options are required.");
        RuleFor(x => x.Options).Must(options => options.Any(o => o.IsCorrect)).WithMessage("At least one option must be marked as correct.");
    }
}

public class CreateCategoryDtoValidator : AbstractValidator<CreateCategoryDto>
{
    public CreateCategoryDtoValidator()
    {
        RuleFor(x => x.NameUz).NotEmpty().MaximumLength(100);
        RuleFor(x => x.NameRu).NotEmpty().MaximumLength(100);
        RuleFor(x => x.NameEn).NotEmpty().MaximumLength(100);
    }
}
