using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TestPlatform.Application.Common;
using TestPlatform.Application.DTOs.Exams;
using TestPlatform.Application.Interfaces;

namespace TestPlatform.WebApi.Controllers;

public class ExamsController : BaseApiController
{
    private readonly IExamService _examService;

    public ExamsController(IExamService examService)
    {
        _examService = examService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<ExamDto>>>> GetExams([FromQuery] ExamFilterDto filter, CancellationToken ct)
    {
        var result = await _examService.GetExamsAsync(filter, ct);
        return OkResponse(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ExamDetailDto>>> GetExamById(Guid id, CancellationToken ct)
    {
        var exam = await _examService.GetExamByIdAsync(id, ct);
        return OkResponse(exam);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<ExamDto>>> CreateExam([FromBody] CreateExamDto request, CancellationToken ct)
    {
        var result = await _examService.CreateExamAsync(request, ct);
        return OkResponse(result, "Exam created successfully.");
    }

    [Authorize]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ExamDto>>> UpdateExam(Guid id, [FromBody] UpdateExamDto request, CancellationToken ct)
    {
        var result = await _examService.UpdateExamAsync(id, request, ct);
        return OkResponse(result, "Exam updated successfully.");
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<string>>> DeleteExam(Guid id, CancellationToken ct)
    {
        await _examService.DeleteExamAsync(id, ct);
        return OkResponse("Exam deleted", "Exam deleted successfully.");
    }

    [Authorize]
    [HttpPost("{id:guid}/publish")]
    public async Task<ActionResult<ApiResponse<ExamDto>>> PublishExam(Guid id, CancellationToken ct)
    {
        var result = await _examService.PublishExamAsync(id, ct);
        return OkResponse(result, "Exam published successfully.");
    }

    [Authorize]
    [HttpPost("{id:guid}/unpublish")]
    public async Task<ActionResult<ApiResponse<ExamDto>>> UnpublishExam(Guid id, CancellationToken ct)
    {
        var result = await _examService.UnpublishExamAsync(id, ct);
        return OkResponse(result, "Exam unpublished successfully.");
    }

    [Authorize]
    [HttpPost("{id:guid}/duplicate")]
    public async Task<ActionResult<ApiResponse<ExamDto>>> DuplicateExam(Guid id, CancellationToken ct)
    {
        var result = await _examService.DuplicateExamAsync(id, ct);
        return OkResponse(result, "Exam duplicated successfully.");
    }

    [Authorize]
    [HttpGet("teacher/my")]
    public async Task<ActionResult<ApiResponse<List<ExamDto>>>> GetTeacherExams(CancellationToken ct)
    {
        var result = await _examService.GetTeacherExamsAsync(null, ct);
        return OkResponse(result);
    }
}
