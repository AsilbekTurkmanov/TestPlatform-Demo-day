namespace TestPlatform.Domain.Entities;

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string TitleUz { get; set; } = string.Empty;
    public string TitleRu { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;

    public string MessageUz { get; set; } = string.Empty;
    public string MessageRu { get; set; } = string.Empty;
    public string MessageEn { get; set; } = string.Empty;

    public string? LinkUrl { get; set; }
    public string Type { get; set; } = "info"; // info, success, warning, exam
    public bool IsRead { get; set; } = false;
}
