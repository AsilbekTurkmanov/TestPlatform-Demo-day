using TestPlatform.Domain.Enums;

namespace TestPlatform.Application.DTOs.Results;

public class ResultDetailDto
{
    public Guid AttemptId { get; set; }
    public Guid ExamId { get; set; }
    public string ExamTitle { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryColor { get; set; } = string.Empty;
    public ExamDifficulty Difficulty { get; set; }
    public int PassingScore { get; set; }

    public DateTime StartedAt { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public AttemptStatus Status { get; set; }

    public int TotalPoints { get; set; }
    public int EarnedPoints { get; set; }
    public double Percentage { get; set; }
    public int CorrectAnswersCount { get; set; }
    public int IncorrectAnswersCount { get; set; }
    public int UnansweredCount { get; set; }
    public bool Passed { get; set; }
    public int TimeSpentSeconds { get; set; }
    public int AllocatedSeconds { get; set; }

    public List<QuestionReviewDto> QuestionReviews { get; set; } = new();
}

public class QuestionReviewDto
{
    public Guid QuestionId { get; set; }
    public string Text { get; set; } = string.Empty;
    public QuestionType QuestionType { get; set; }
    public int Points { get; set; }
    public int EarnedPoints { get; set; }
    public int Order { get; set; }
    public string? Explanation { get; set; }
    public string? CodeSnippet { get; set; }
    public bool? IsCorrect { get; set; }
    public bool WasAnswered { get; set; }
    public List<Guid> SelectedOptionIds { get; set; } = new();
    public List<OptionReviewDto> Options { get; set; } = new();
}

public class OptionReviewDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public bool IsSelected { get; set; }
    public int Order { get; set; }
}

public class ParticipantResultDto
{
    public Guid AttemptId { get; set; }
    public Guid UserId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string StudentEmail { get; set; } = string.Empty;
    public string? StudentAvatarUrl { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public AttemptStatus Status { get; set; }
    public int EarnedPoints { get; set; }
    public int TotalPoints { get; set; }
    public double Percentage { get; set; }
    public bool Passed { get; set; }
    public int TimeSpentSeconds { get; set; }
}
