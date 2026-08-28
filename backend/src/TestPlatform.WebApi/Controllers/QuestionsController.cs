using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TestPlatform.Application.Common;
using TestPlatform.Application.DTOs.Questions;
using TestPlatform.Application.Interfaces;

namespace TestPlatform.WebApi.Controllers;

public class QuestionsController : BaseApiController
{
    private readonly IQuestionService _questionService;

    public QuestionsController(IQuestionService questionService)
    {
        _questionService = questionService;
    }

    [Authorize]
    [HttpGet("exam/{examId:guid}")]
    public async Task<ActionResult<ApiResponse<List<QuestionDto>>>> GetExamQuestions(Guid examId, CancellationToken ct)
    {
        var questions = await _questionService.GetExamQuestionsAsync(examId, ct);
        return OkResponse(questions);
    }

    [Authorize]
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<QuestionDto>>> GetQuestionById(Guid id, CancellationToken ct)
    {
        var question = await _questionService.GetQuestionByIdAsync(id, ct);
        return OkResponse(question);
    }

    [Authorize]
    [HttpPost("exam/{examId:guid}")]
    public async Task<ActionResult<ApiResponse<QuestionDto>>> CreateQuestion(Guid examId, [FromBody] CreateQuestionDto request, CancellationToken ct)
    {
        var question = await _questionService.CreateQuestionAsync(examId, request, ct);
        return OkResponse(question, "Question created successfully.");
    }

    [Authorize]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<QuestionDto>>> UpdateQuestion(Guid id, [FromBody] UpdateQuestionDto request, CancellationToken ct)
    {
        var question = await _questionService.UpdateQuestionAsync(id, request, ct);
        return OkResponse(question, "Question updated successfully.");
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<string>>> DeleteQuestion(Guid id, CancellationToken ct)
    {
        await _questionService.DeleteQuestionAsync(id, ct);
        return OkResponse("Question deleted", "Question deleted successfully.");
    }

    [Authorize]
    [HttpPut("exam/{examId:guid}/reorder")]
    public async Task<ActionResult<ApiResponse<string>>> ReorderQuestions(Guid examId, [FromBody] ReorderQuestionsDto request, CancellationToken ct)
    {
        await _questionService.ReorderQuestionsAsync(examId, request, ct);
        return OkResponse("Questions reordered", "Questions reordered successfully.");
    }
}
