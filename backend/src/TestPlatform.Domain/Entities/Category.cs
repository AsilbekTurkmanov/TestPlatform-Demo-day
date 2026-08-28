namespace TestPlatform.Domain.Entities;

public class Category : BaseEntity
{
    public string NameUz { get; set; } = string.Empty;
    public string NameRu { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? DescriptionUz { get; set; }
    public string? DescriptionRu { get; set; }
    public string? DescriptionEn { get; set; }
    public string Icon { get; set; } = "BookOpen";
    public string Color { get; set; } = "#3B82F6";
    public int DisplayOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    public ICollection<Exam> Exams { get; set; } = new List<Exam>();
}
