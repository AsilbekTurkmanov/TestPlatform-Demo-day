namespace TestPlatform.Domain.Entities;

public class Answer : BaseEntity
{
    public Guid ExamAttemptId { get; set; }
    public ExamAttempt ExamAttempt { get; set; } = null!;

    public Guid QuestionId { get; set; }
    public Question Question { get; set; } = null!;

    // JSON serialized list of selected option Guid IDs e.g. ["guid1", "guid2"]
    public string SelectedOptionIdsJson { get; set; } = "[]";
    public bool? IsCorrect { get; set; }
    public int EarnedPoints { get; set; } = 0;
    public bool IsMarkedForReview { get; set; } = false;
    public DateTime AnsweredAt { get; set; } = DateTime.UtcNow;
}
