using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TestPlatform.Application.Common.Exceptions;
using TestPlatform.Application.DTOs.Attempts;
using TestPlatform.Application.DTOs.Results;
using TestPlatform.Application.Interfaces;
using TestPlatform.Domain.Enums;

namespace TestPlatform.Application.Services;

public class ResultService : IResultService
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ResultService(IAppDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<ResultDetailDto> GetResultByIdAsync(Guid attemptId, CancellationToken ct = default)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();
        var attempt = await _db.ExamAttempts
            .AsNoTracking()
            .Include(a => a.Exam)
                .ThenInclude(e => e.Category)
            .Include(a => a.Exam)
                .ThenInclude(e => e.Questions.OrderBy(q => q.Order))
                    .ThenInclude(q => q.Options.OrderBy(o => o.Order))
            .Include(a => a.Answers)
            .FirstOrDefaultAsync(a => a.Id == attemptId, ct)
            ?? throw new NotFoundException("Result", attemptId);

        if (_currentUser.Role != UserRole.Admin && attempt.UserId != userId && attempt.Exam.TeacherId != userId)
        {
            throw new ForbiddenException("You cannot view results for this attempt.");
        }

        var reviews = new List<QuestionReviewDto>();

        foreach (var q in attempt.Exam.Questions.OrderBy(q => q.Order))
        {
            var answer = attempt.Answers.FirstOrDefault(a => a.QuestionId == q.Id);
            var selectedIds = answer != null ? ParseGuidList(answer.SelectedOptionIdsJson) : new List<Guid>();

            reviews.Add(new QuestionReviewDto
            {
                QuestionId = q.Id,
                Text = q.Text,
                QuestionType = q.QuestionType,
                Points = q.Points,
                EarnedPoints = answer?.EarnedPoints ?? 0,
                Order = q.Order,
                Explanation = q.Explanation,
                CodeSnippet = q.CodeSnippet,
                IsCorrect = answer?.IsCorrect,
                WasAnswered = selectedIds.Count > 0,
                SelectedOptionIds = selectedIds,
                Options = q.Options.OrderBy(o => o.Order).Select(o => new OptionReviewDto
                {
                    Id = o.Id,
                    Text = o.Text,
                    IsCorrect = o.IsCorrect,
                    IsSelected = selectedIds.Contains(o.Id),
                    Order = o.Order
                }).ToList()
            });
        }

        return new ResultDetailDto
        {
            AttemptId = attempt.Id,
            ExamId = attempt.ExamId,
            ExamTitle = attempt.Exam.Title,
            CategoryName = attempt.Exam.Category.NameUz,
            CategoryColor = attempt.Exam.Category.Color,
            Difficulty = attempt.Exam.Difficulty,
            PassingScore = attempt.Exam.PassingScore,
            StartedAt = attempt.StartedAt,
            SubmittedAt = attempt.SubmittedAt,
            Status = attempt.Status,
            TotalPoints = attempt.TotalPoints,
            EarnedPoints = attempt.EarnedPoints,
            Percentage = attempt.Percentage,
            CorrectAnswersCount = attempt.CorrectAnswersCount,
            IncorrectAnswersCount = attempt.IncorrectAnswersCount,
            UnansweredCount = attempt.UnansweredCount,
            Passed = attempt.Passed,
            TimeSpentSeconds = attempt.TimeSpentSeconds,
            AllocatedSeconds = attempt.Exam.DurationMinutes * 60,
            QuestionReviews = reviews
        };
    }

    public async Task<List<StudentAttemptDto>> GetMyResultsAsync(CancellationToken ct = default)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();

        return await _db.ExamAttempts
            .AsNoTracking()
            .Include(a => a.Exam)
                .ThenInclude(e => e.Category)
            .Where(a => a.UserId == userId && (a.Status == AttemptStatus.Completed || a.Status == AttemptStatus.Expired))
            .OrderByDescending(a => a.SubmittedAt ?? a.StartedAt)
            .Select(a => new StudentAttemptDto
            {
                Id = a.Id,
                ExamId = a.ExamId,
                ExamTitle = a.Exam.Title,
                CategoryName = a.Exam.Category.NameUz,
                CategoryColor = a.Exam.Category.Color,
                Difficulty = a.Exam.Difficulty,
                StartedAt = a.StartedAt,
                SubmittedAt = a.SubmittedAt,
                Status = a.Status,
                TotalPoints = a.TotalPoints,
                EarnedPoints = a.EarnedPoints,
                Percentage = a.Percentage,
                Passed = a.Passed,
                TimeSpentSeconds = a.TimeSpentSeconds
            })
            .ToListAsync(ct);
    }

    public async Task<List<ParticipantResultDto>> GetExamParticipantsAsync(Guid examId, CancellationToken ct = default)
    {
        var exam = await _db.Exams.AsNoTracking().FirstOrDefaultAsync(e => e.Id == examId, ct)
            ?? throw new NotFoundException("Exam", examId);

        var userId = _currentUser.UserId ?? throw new UnauthorizedException();
        if (_currentUser.Role != UserRole.Admin && exam.TeacherId != userId)
        {
            throw new ForbiddenException("You do not have access to view participants for this exam.");
        }

        return await _db.ExamAttempts
            .AsNoTracking()
            .Include(a => a.User)
            .Where(a => a.ExamId == examId)
            .OrderByDescending(a => a.StartedAt)
            .Select(a => new ParticipantResultDto
            {
                AttemptId = a.Id,
                UserId = a.UserId,
                StudentName = a.User.FullName,
                StudentEmail = a.User.Email,
                StudentAvatarUrl = a.User.AvatarUrl,
                StartedAt = a.StartedAt,
                SubmittedAt = a.SubmittedAt,
                Status = a.Status,
                EarnedPoints = a.EarnedPoints,
                TotalPoints = a.TotalPoints,
                Percentage = a.Percentage,
                Passed = a.Passed,
                TimeSpentSeconds = a.TimeSpentSeconds
            })
            .ToListAsync(ct);
    }

    private static List<Guid> ParseGuidList(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new List<Guid>();
        try
        {
            return JsonSerializer.Deserialize<List<Guid>>(json) ?? new List<Guid>();
        }
        catch
        {
            return new List<Guid>();
        }
    }
}
