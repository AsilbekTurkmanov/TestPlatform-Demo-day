using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TestPlatform.Application.Common;
using TestPlatform.Application.DTOs.Analytics;
using TestPlatform.Application.Interfaces;

namespace TestPlatform.WebApi.Controllers;

[Authorize]
public class AnalyticsController : BaseApiController
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    [HttpGet("student")]
    public async Task<ActionResult<ApiResponse<StudentAnalyticsDto>>> GetStudentAnalytics(CancellationToken ct)
    {
        var result = await _analyticsService.GetStudentAnalyticsAsync(ct);
        return OkResponse(result);
    }

    [HttpGet("teacher")]
    public async Task<ActionResult<ApiResponse<TeacherAnalyticsDto>>> GetTeacherAnalytics(CancellationToken ct)
    {
        var result = await _analyticsService.GetTeacherAnalyticsAsync(ct);
        return OkResponse(result);
    }

    [HttpGet("admin")]
    public async Task<ActionResult<ApiResponse<AdminAnalyticsDto>>> GetAdminAnalytics(CancellationToken ct)
    {
        var result = await _analyticsService.GetAdminAnalyticsAsync(ct);
        return OkResponse(result);
    }
}
