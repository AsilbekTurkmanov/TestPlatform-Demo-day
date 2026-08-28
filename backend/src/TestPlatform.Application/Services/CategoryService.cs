using Microsoft.EntityFrameworkCore;
using TestPlatform.Application.Common.Exceptions;
using TestPlatform.Application.DTOs.Categories;
using TestPlatform.Application.Interfaces;
using TestPlatform.Domain.Entities;
using TestPlatform.Domain.Enums;

namespace TestPlatform.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CategoryService(IAppDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<CategoryDto>> GetAllCategoriesAsync(bool activeOnly = false, CancellationToken ct = default)
    {
        var query = _db.Categories
            .AsNoTracking()
            .Include(c => c.Exams)
            .AsQueryable();

        if (activeOnly)
        {
            query = query.Where(c => c.IsActive);
        }

        return await query
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.NameUz)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                NameUz = c.NameUz,
                NameRu = c.NameRu,
                NameEn = c.NameEn,
                Slug = c.Slug,
                DescriptionUz = c.DescriptionUz,
                DescriptionRu = c.DescriptionRu,
                DescriptionEn = c.DescriptionEn,
                Icon = c.Icon,
                Color = c.Color,
                DisplayOrder = c.DisplayOrder,
                IsActive = c.IsActive,
                ExamCount = c.Exams.Count(e => e.Status == ExamStatus.Published)
            })
            .ToListAsync(ct);
    }

    public async Task<CategoryDto> GetCategoryByIdAsync(Guid id, CancellationToken ct = default)
    {
        var c = await _db.Categories
            .AsNoTracking()
            .Include(c => c.Exams)
            .FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException("Category", id);

        return new CategoryDto
        {
            Id = c.Id,
            NameUz = c.NameUz,
            NameRu = c.NameRu,
            NameEn = c.NameEn,
            Slug = c.Slug,
            DescriptionUz = c.DescriptionUz,
            DescriptionRu = c.DescriptionRu,
            DescriptionEn = c.DescriptionEn,
            Icon = c.Icon,
            Color = c.Color,
            DisplayOrder = c.DisplayOrder,
            IsActive = c.IsActive,
            ExamCount = c.Exams.Count(e => e.Status == ExamStatus.Published)
        };
    }

    public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto request, CancellationToken ct = default)
    {
        if (_currentUser.Role != UserRole.Admin)
        {
            throw new ForbiddenException("Only admins can create categories.");
        }

        var slug = string.IsNullOrWhiteSpace(request.Slug)
            ? GenerateSlug(request.NameEn.Length > 0 ? request.NameEn : request.NameUz)
            : request.Slug.Trim().ToLowerInvariant();

        var exists = await _db.Categories.AnyAsync(c => c.Slug == slug, ct);
        if (exists)
        {
            slug = $"{slug}-{Guid.NewGuid().ToString()[..6]}";
        }

        var category = new Category
        {
            NameUz = request.NameUz.Trim(),
            NameRu = request.NameRu.Trim(),
            NameEn = request.NameEn.Trim(),
            Slug = slug,
            DescriptionUz = request.DescriptionUz?.Trim(),
            DescriptionRu = request.DescriptionRu?.Trim(),
            DescriptionEn = request.DescriptionEn?.Trim(),
            Icon = string.IsNullOrWhiteSpace(request.Icon) ? "BookOpen" : request.Icon.Trim(),
            Color = string.IsNullOrWhiteSpace(request.Color) ? "#3B82F6" : request.Color.Trim(),
            DisplayOrder = request.DisplayOrder,
            IsActive = true
        };

        _db.Categories.Add(category);
        await _db.SaveChangesAsync(ct);

        return await GetCategoryByIdAsync(category.Id, ct);
    }

    public async Task<CategoryDto> UpdateCategoryAsync(Guid id, UpdateCategoryDto request, CancellationToken ct = default)
    {
        if (_currentUser.Role != UserRole.Admin)
        {
            throw new ForbiddenException("Only admins can update categories.");
        }

        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException("Category", id);

        var slug = string.IsNullOrWhiteSpace(request.Slug)
            ? category.Slug
            : request.Slug.Trim().ToLowerInvariant();

        category.NameUz = request.NameUz.Trim();
        category.NameRu = request.NameRu.Trim();
        category.NameEn = request.NameEn.Trim();
        category.Slug = slug;
        category.DescriptionUz = request.DescriptionUz?.Trim();
        category.DescriptionRu = request.DescriptionRu?.Trim();
        category.DescriptionEn = request.DescriptionEn?.Trim();
        category.Icon = string.IsNullOrWhiteSpace(request.Icon) ? category.Icon : request.Icon.Trim();
        category.Color = string.IsNullOrWhiteSpace(request.Color) ? category.Color : request.Color.Trim();
        category.DisplayOrder = request.DisplayOrder;
        category.IsActive = request.IsActive;
        category.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        return await GetCategoryByIdAsync(category.Id, ct);
    }

    public async Task DeleteCategoryAsync(Guid id, CancellationToken ct = default)
    {
        if (_currentUser.Role != UserRole.Admin)
        {
            throw new ForbiddenException("Only admins can delete categories.");
        }

        var category = await _db.Categories
            .Include(c => c.Exams)
            .FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException("Category", id);

        if (category.Exams.Any())
        {
            throw new ValidationException("Cannot delete category with associated exams. Please reassign or delete exams first.");
        }

        _db.Categories.Remove(category);
        await _db.SaveChangesAsync(ct);
    }

    private static string GenerateSlug(string text)
    {
        var slug = text.ToLowerInvariant().Trim();
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"\s+", " ").Trim();
        slug = slug.Replace(" ", "-");
        return string.IsNullOrWhiteSpace(slug) ? "category" : slug;
    }
}
