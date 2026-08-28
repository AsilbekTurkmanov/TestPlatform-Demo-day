using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TestPlatform.Application.Common;
using TestPlatform.Application.DTOs.Categories;
using TestPlatform.Application.Interfaces;

namespace TestPlatform.WebApi.Controllers;

public class CategoriesController : BaseApiController
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<CategoryDto>>>> GetCategories([FromQuery] bool activeOnly = false, CancellationToken ct = default)
    {
        var result = await _categoryService.GetAllCategoriesAsync(activeOnly, ct);
        return OkResponse(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> GetCategoryById(Guid id, CancellationToken ct)
    {
        var result = await _categoryService.GetCategoryByIdAsync(id, ct);
        return OkResponse(result);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> CreateCategory([FromBody] CreateCategoryDto request, CancellationToken ct)
    {
        var result = await _categoryService.CreateCategoryAsync(request, ct);
        return OkResponse(result, "Category created successfully.");
    }

    [Authorize]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> UpdateCategory(Guid id, [FromBody] UpdateCategoryDto request, CancellationToken ct)
    {
        var result = await _categoryService.UpdateCategoryAsync(id, request, ct);
        return OkResponse(result, "Category updated successfully.");
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<string>>> DeleteCategory(Guid id, CancellationToken ct)
    {
        await _categoryService.DeleteCategoryAsync(id, ct);
        return OkResponse("Category deleted", "Category deleted successfully.");
    }
}
