using TestPlatform.Application.DTOs.Categories;
using TestPlatform.Application.DTOs.Questions;
using TestPlatform.Domain.Enums;

namespace TestPlatform.Application.DTOs.Exams;

public class ExamDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryColor { get; set; } = string.Empty;
    public string CategoryIcon { get; set; } = string.Empty;
    public Guid TeacherId { get; set; }
    public string TeacherName { get; set; } = string.Empty;
    public ExamDifficulty Difficulty { get; set; }
    public int DurationMinutes { get; set; }
    public int PassingScore { get; set; }
    public ExamVisibility Visibility { get; set; }
    public ExamStatus Status { get; set; }
    public int TotalQuestions { get; set; }
    public int TotalPoints { get; set; }
    public int MaxAttempts { get; set; }
    public int ParticipantCount { get; set; }
    public double AverageScore { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class ExamDetailDto : ExamDto
{
    public CategoryDto? Category { get; set; }
    public List<QuestionDto> Questions { get; set; } = new();
    public bool HasUserAttempted { get; set; }
    public int UserAttemptsCount { get; set; }
    public double? BestScore { get; set; }
}

public class CreateExamDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public ExamDifficulty Difficulty { get; set; } = ExamDifficulty.Medium;
    public int DurationMinutes { get; set; } = 30;
    public int PassingScore { get; set; } = 60;
    public ExamVisibility Visibility { get; set; } = ExamVisibility.Public;
    public ExamStatus Status { get; set; } = ExamStatus.Draft;
    public int MaxAttempts { get; set; } = 3;
}

public class UpdateExamDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public ExamDifficulty Difficulty { get; set; }
    public int DurationMinutes { get; set; }
    public int PassingScore { get; set; }
    public ExamVisibility Visibility { get; set; }
    public ExamStatus Status { get; set; }
    public int MaxAttempts { get; set; }
}

public class ExamFilterDto
{
    public string? Search { get; set; }
    public Guid? CategoryId { get; set; }
    public ExamDifficulty? Difficulty { get; set; }
    public ExamStatus? Status { get; set; }
    public ExamVisibility? Visibility { get; set; }
    public Guid? TeacherId { get; set; }
    public string? SortBy { get; set; } // "newest", "popular", "duration", "title"
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
