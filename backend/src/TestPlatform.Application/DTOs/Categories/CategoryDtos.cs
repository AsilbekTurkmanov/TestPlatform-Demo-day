namespace TestPlatform.Application.DTOs.Categories;

public class CategoryDto
{
    public Guid Id { get; set; }
    public string NameUz { get; set; } = string.Empty;
    public string NameRu { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? DescriptionUz { get; set; }
    public string? DescriptionRu { get; set; }
    public string? DescriptionEn { get; set; }
    public string Icon { get; set; } = "BookOpen";
    public string Color { get; set; } = "#3B82F6";
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public int ExamCount { get; set; }
}

public class CreateCategoryDto
{
    public string NameUz { get; set; } = string.Empty;
    public string NameRu { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public string? DescriptionUz { get; set; }
    public string? DescriptionRu { get; set; }
    public string? DescriptionEn { get; set; }
    public string Icon { get; set; } = "BookOpen";
    public string Color { get; set; } = "#3B82F6";
    public int DisplayOrder { get; set; } = 0;
}

public class UpdateCategoryDto
{
    public string NameUz { get; set; } = string.Empty;
    public string NameRu { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public string? DescriptionUz { get; set; }
    public string? DescriptionRu { get; set; }
    public string? DescriptionEn { get; set; }
    public string Icon { get; set; } = "BookOpen";
    public string Color { get; set; } = "#3B82F6";
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
}
