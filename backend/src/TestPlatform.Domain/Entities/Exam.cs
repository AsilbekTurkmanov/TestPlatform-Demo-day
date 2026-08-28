using TestPlatform.Domain.Enums;

namespace TestPlatform.Domain.Entities;

public class Exam : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public Guid TeacherId { get; set; }
    public User Teacher { get; set; } = null!;

    public ExamDifficulty Difficulty { get; set; } = ExamDifficulty.Medium;
    public int DurationMinutes { get; set; } = 30;
    public int PassingScore { get; set; } = 60; // percentage
    public ExamVisibility Visibility { get; set; } = ExamVisibility.Public;
    public ExamStatus Status { get; set; } = ExamStatus.Draft;

    public int TotalQuestions { get; set; } = 0;
    public int TotalPoints { get; set; } = 0;
    public int MaxAttempts { get; set; } = 3;

    public ICollection<Question> Questions { get; set; } = new List<Question>();
    public ICollection<ExamAttempt> Attempts { get; set; } = new List<ExamAttempt>();
}
