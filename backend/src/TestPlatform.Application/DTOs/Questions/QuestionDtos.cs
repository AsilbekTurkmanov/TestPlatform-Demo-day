using TestPlatform.Domain.Enums;

namespace TestPlatform.Application.DTOs.Questions;

public class QuestionDto
{
    public Guid Id { get; set; }
    public Guid ExamId { get; set; }
    public string Text { get; set; } = string.Empty;
    public QuestionType QuestionType { get; set; }
    public int Points { get; set; }
    public int Order { get; set; }
    public string? Explanation { get; set; }
    public string? CodeSnippet { get; set; }
    public List<QuestionOptionDto> Options { get; set; } = new();
}

public class QuestionOptionDto
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int Order { get; set; }
}

public class CreateQuestionDto
{
    public string Text { get; set; } = string.Empty;
    public QuestionType QuestionType { get; set; } = QuestionType.SingleChoice;
    public int Points { get; set; } = 10;
    public int Order { get; set; } = 0;
    public string? Explanation { get; set; }
    public string? CodeSnippet { get; set; }
    public List<CreateOptionDto> Options { get; set; } = new();
}

public class CreateOptionDto
{
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; } = false;
    public int Order { get; set; } = 0;
}

public class UpdateQuestionDto
{
    public string Text { get; set; } = string.Empty;
    public QuestionType QuestionType { get; set; }
    public int Points { get; set; }
    public int Order { get; set; }
    public string? Explanation { get; set; }
    public string? CodeSnippet { get; set; }
    public List<UpdateOptionDto> Options { get; set; } = new();
}

public class UpdateOptionDto
{
    public Guid? Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int Order { get; set; }
}

public class ReorderQuestionsDto
{
    public List<QuestionOrderItem> Items { get; set; } = new();
}

public class QuestionOrderItem
{
    public Guid QuestionId { get; set; }
    public int Order { get; set; }
}
