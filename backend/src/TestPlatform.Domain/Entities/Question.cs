using TestPlatform.Domain.Enums;

namespace TestPlatform.Domain.Entities;

public class Question : BaseEntity
{
    public Guid ExamId { get; set; }
    public Exam Exam { get; set; } = null!;

    public string Text { get; set; } = string.Empty;
    public QuestionType QuestionType { get; set; } = QuestionType.SingleChoice;
    public int Points { get; set; } = 10;
    public int Order { get; set; } = 0;
    public string? Explanation { get; set; }
    public string? CodeSnippet { get; set; }

    public ICollection<QuestionOption> Options { get; set; } = new List<QuestionOption>();
    public ICollection<Answer> Answers { get; set; } = new List<Answer>();
}
