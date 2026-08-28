using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TestPlatform.Application.Common;
using TestPlatform.Application.DTOs.Attempts;
using TestPlatform.Application.DTOs.Results;
using TestPlatform.Application.Interfaces;

namespace TestPlatform.WebApi.Controllers;

[Authorize]
public class ResultsController : BaseApiController
{
    private readonly IResultService _resultService;

    public ResultsController(IResultService resultService)
    {
        _resultService = resultService;
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ResultDetailDto>>> GetResultById(Guid id, CancellationToken ct)
    {
        var result = await _resultService.GetResultByIdAsync(id, ct);
        return OkResponse(result);
    }

    [HttpGet("my")]
    public async Task<ActionResult<ApiResponse<List<StudentAttemptDto>>>> GetMyResults(CancellationToken ct)
    {
        var results = await _resultService.GetMyResultsAsync(ct);
        return OkResponse(results);
    }

    [HttpGet("exams/{examId:guid}/participants")]
    public async Task<ActionResult<ApiResponse<List<ParticipantResultDto>>>> GetExamParticipants(Guid examId, CancellationToken ct)
    {
        var participants = await _resultService.GetExamParticipantsAsync(examId, ct);
        return OkResponse(participants);
    }
}
