using TestPlatform.Domain.Enums;

namespace TestPlatform.Domain.Entities;

public class ExamAttempt : BaseEntity
{
    public Guid ExamId { get; set; }
    public Exam Exam { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public AttemptStatus Status { get; set; } = AttemptStatus.InProgress;

    public int TotalPoints { get; set; } = 0;
    public int EarnedPoints { get; set; } = 0;
    public double Percentage { get; set; } = 0.0;
    public int CorrectAnswersCount { get; set; } = 0;
    public int IncorrectAnswersCount { get; set; } = 0;
    public int UnansweredCount { get; set; } = 0;
    public bool Passed { get; set; } = false;
    public int TimeSpentSeconds { get; set; } = 0;

    public ICollection<Answer> Answers { get; set; } = new List<Answer>();
}
