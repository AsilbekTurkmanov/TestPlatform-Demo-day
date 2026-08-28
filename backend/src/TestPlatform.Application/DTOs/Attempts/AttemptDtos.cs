using TestPlatform.Domain.Enums;

namespace TestPlatform.Application.DTOs.Attempts;

public class StartExamResponse
{
    public Guid AttemptId { get; set; }
    public Guid ExamId { get; set; }
    public string ExamTitle { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public int TotalQuestions { get; set; }
    public int TotalPoints { get; set; }
    public int PassingScore { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public int RemainingSeconds { get; set; }
    public List<ExamTakingQuestionDto> Questions { get; set; } = new();
    public List<SavedAnswerDto> SavedAnswers { get; set; } = new();
}

public class AttemptDetailDto
{
    public Guid AttemptId { get; set; }
    public Guid ExamId { get; set; }
    public string ExamTitle { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public int TotalQuestions { get; set; }
    public int TotalPoints { get; set; }
    public int PassingScore { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public int RemainingSeconds { get; set; }
    public AttemptStatus Status { get; set; }
    public List<ExamTakingQuestionDto> Questions { get; set; } = new();
    public List<SavedAnswerDto> SavedAnswers { get; set; } = new();
}

public class ExamTakingQuestionDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public QuestionType QuestionType { get; set; }
    public int Points { get; set; }
    public int Order { get; set; }
    public string? CodeSnippet { get; set; }
    public List<ExamTakingOptionDto> Options { get; set; } = new();
}

public class ExamTakingOptionDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public int Order { get; set; }
}

public class SavedAnswerDto
{
    public Guid QuestionId { get; set; }
    public List<Guid> SelectedOptionIds { get; set; } = new();
    public bool IsMarkedForReview { get; set; }
    public DateTime AnsweredAt { get; set; }
}

public class SaveAnswerDto
{
    public Guid QuestionId { get; set; }
    public List<Guid> SelectedOptionIds { get; set; } = new();
    public bool IsMarkedForReview { get; set; }
}

public class SubmitExamResponse
{
    public Guid AttemptId { get; set; }
    public Guid ExamId { get; set; }
    public string ExamTitle { get; set; } = string.Empty;
    public int TotalPoints { get; set; }
    public int EarnedPoints { get; set; }
    public double Percentage { get; set; }
    public int CorrectAnswersCount { get; set; }
    public int IncorrectAnswersCount { get; set; }
    public int UnansweredCount { get; set; }
    public bool Passed { get; set; }
    public int PassingScore { get; set; }
    public int TimeSpentSeconds { get; set; }
    public DateTime SubmittedAt { get; set; }
}

public class StudentAttemptDto
{
    public Guid Id { get; set; }
    public Guid ExamId { get; set; }
    public string ExamTitle { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryColor { get; set; } = string.Empty;
    public ExamDifficulty Difficulty { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public AttemptStatus Status { get; set; }
    public int TotalPoints { get; set; }
    public int EarnedPoints { get; set; }
    public double Percentage { get; set; }
    public bool Passed { get; set; }
    public int TimeSpentSeconds { get; set; }
}
