using TestPlatform.Application.Common;
using TestPlatform.Application.DTOs.Analytics;
using TestPlatform.Application.DTOs.Attempts;
using TestPlatform.Application.DTOs.Auth;
using TestPlatform.Application.DTOs.Categories;
using TestPlatform.Application.DTOs.Exams;
using TestPlatform.Application.DTOs.Questions;
using TestPlatform.Application.DTOs.Results;
using TestPlatform.Application.DTOs.Users;
using TestPlatform.Domain.Enums;

namespace TestPlatform.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default);
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken ct = default);
    Task LogoutAsync(string refreshToken, CancellationToken ct = default);
    Task<UserProfileDto> GetCurrentUserProfileAsync(CancellationToken ct = default);
    Task<UserProfileDto> UpdateProfileAsync(UpdateProfileRequest request, CancellationToken ct = default);
    Task ChangePasswordAsync(ChangePasswordRequest request, CancellationToken ct = default);
}

public interface IExamService
{
    Task<PagedResult<ExamDto>> GetExamsAsync(ExamFilterDto filter, CancellationToken ct = default);
    Task<ExamDetailDto> GetExamByIdAsync(Guid id, CancellationToken ct = default);
    Task<ExamDto> CreateExamAsync(CreateExamDto request, CancellationToken ct = default);
    Task<ExamDto> UpdateExamAsync(Guid id, UpdateExamDto request, CancellationToken ct = default);
    Task DeleteExamAsync(Guid id, CancellationToken ct = default);
    Task<ExamDto> PublishExamAsync(Guid id, CancellationToken ct = default);
    Task<ExamDto> UnpublishExamAsync(Guid id, CancellationToken ct = default);
    Task<ExamDto> DuplicateExamAsync(Guid id, CancellationToken ct = default);
    Task<List<ExamDto>> GetTeacherExamsAsync(Guid? teacherId = null, CancellationToken ct = default);
}

public interface IQuestionService
{
    Task<List<QuestionDto>> GetExamQuestionsAsync(Guid examId, CancellationToken ct = default);
    Task<QuestionDto> GetQuestionByIdAsync(Guid id, CancellationToken ct = default);
    Task<QuestionDto> CreateQuestionAsync(Guid examId, CreateQuestionDto request, CancellationToken ct = default);
    Task<QuestionDto> UpdateQuestionAsync(Guid id, UpdateQuestionDto request, CancellationToken ct = default);
    Task DeleteQuestionAsync(Guid id, CancellationToken ct = default);
    Task ReorderQuestionsAsync(Guid examId, ReorderQuestionsDto request, CancellationToken ct = default);
}

public interface IAttemptService
{
    Task<StartExamResponse> StartExamAsync(Guid examId, CancellationToken ct = default);
    Task<AttemptDetailDto> GetAttemptAsync(Guid attemptId, CancellationToken ct = default);
    Task<SavedAnswerDto> SaveAnswerAsync(Guid attemptId, SaveAnswerDto request, CancellationToken ct = default);
    Task<SubmitExamResponse> SubmitExamAsync(Guid attemptId, CancellationToken ct = default);
    Task<List<StudentAttemptDto>> GetMyAttemptsAsync(CancellationToken ct = default);
    Task AutoExpireAttemptsAsync(CancellationToken ct = default);
}

public interface IResultService
{
    Task<ResultDetailDto> GetResultByIdAsync(Guid attemptId, CancellationToken ct = default);
    Task<List<StudentAttemptDto>> GetMyResultsAsync(CancellationToken ct = default);
    Task<List<ParticipantResultDto>> GetExamParticipantsAsync(Guid examId, CancellationToken ct = default);
}

public interface IAnalyticsService
{
    Task<StudentAnalyticsDto> GetStudentAnalyticsAsync(CancellationToken ct = default);
    Task<TeacherAnalyticsDto> GetTeacherAnalyticsAsync(CancellationToken ct = default);
    Task<AdminAnalyticsDto> GetAdminAnalyticsAsync(CancellationToken ct = default);
}

public interface IUserService
{
    Task<PagedResult<UserDto>> GetUsersAsync(UserFilterDto filter, CancellationToken ct = default);
    Task<UserDto> GetUserByIdAsync(Guid id, CancellationToken ct = default);
    Task<UserDto> CreateUserAsync(CreateUserDto request, CancellationToken ct = default);
    Task<UserDto> UpdateUserAsync(Guid id, UpdateUserDto request, CancellationToken ct = default);
    Task DeleteUserAsync(Guid id, CancellationToken ct = default);
    Task ActivateUserAsync(Guid id, CancellationToken ct = default);
    Task DeactivateUserAsync(Guid id, CancellationToken ct = default);
}

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllCategoriesAsync(bool activeOnly = false, CancellationToken ct = default);
    Task<CategoryDto> GetCategoryByIdAsync(Guid id, CancellationToken ct = default);
    Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto request, CancellationToken ct = default);
    Task<CategoryDto> UpdateCategoryAsync(Guid id, UpdateCategoryDto request, CancellationToken ct = default);
    Task DeleteCategoryAsync(Guid id, CancellationToken ct = default);
}
