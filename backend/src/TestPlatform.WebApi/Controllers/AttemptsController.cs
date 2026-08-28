using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TestPlatform.Application.Common;
using TestPlatform.Application.DTOs.Attempts;
using TestPlatform.Application.Interfaces;

namespace TestPlatform.WebApi.Controllers;

[Authorize]
public class AttemptsController : BaseApiController
{
    private readonly IAttemptService _attemptService;

    public AttemptsController(IAttemptService attemptService)
    {
        _attemptService = attemptService;
    }

    [HttpPost("exams/{examId:guid}/start")]
    public async Task<ActionResult<ApiResponse<StartExamResponse>>> StartExam(Guid examId, CancellationToken ct)
    {
        var result = await _attemptService.StartExamAsync(examId, ct);
        return OkResponse(result, "Exam started successfully.");
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<AttemptDetailDto>>> GetAttempt(Guid id, CancellationToken ct)
    {
        var result = await _attemptService.GetAttemptAsync(id, ct);
        return OkResponse(result);
    }

    [HttpPost("{id:guid}/answers")]
    public async Task<ActionResult<ApiResponse<SavedAnswerDto>>> SaveAnswer(Guid id, [FromBody] SaveAnswerDto request, CancellationToken ct)
    {
        var result = await _attemptService.SaveAnswerAsync(id, request, ct);
        return OkResponse(result, "Answer saved.");
    }

    [HttpPost("{id:guid}/submit")]
    public async Task<ActionResult<ApiResponse<SubmitExamResponse>>> SubmitExam(Guid id, CancellationToken ct)
    {
        var result = await _attemptService.SubmitExamAsync(id, ct);
        return OkResponse(result, "Exam submitted successfully.");
    }

    [HttpGet("my")]
    public async Task<ActionResult<ApiResponse<List<StudentAttemptDto>>>> GetMyAttempts(CancellationToken ct)
    {
        var result = await _attemptService.GetMyAttemptsAsync(ct);
        return OkResponse(result);
    }
}
