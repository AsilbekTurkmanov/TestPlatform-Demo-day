using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TestPlatform.Application.Common.Exceptions;
using TestPlatform.Application.DTOs.Attempts;
using TestPlatform.Application.Interfaces;
using TestPlatform.Domain.Entities;
using TestPlatform.Domain.Enums;

namespace TestPlatform.Application.Services;

public class AttemptService : IAttemptService
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AttemptService(IAppDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<StartExamResponse> StartExamAsync(Guid examId, CancellationToken ct = default)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();
        var exam = await _db.Exams
            .Include(e => e.Category)
            .Include(e => e.Questions.OrderBy(q => q.Order))
                .ThenInclude(q => q.Options.OrderBy(o => o.Order))
            .FirstOrDefaultAsync(e => e.Id == examId, ct)
            ?? throw new NotFoundException("Exam", examId);

        if (exam.Status != ExamStatus.Published)
        {
            throw new ValidationException("This exam is currently not available.");
        }

        if (!exam.Questions.Any())
        {
            throw new ValidationException("This exam has no questions.");
        }

        // Check if there is an active (in-progress) attempt
        var activeAttempt = await _db.ExamAttempts
            .Include(a => a.Answers)
            .FirstOrDefaultAsync(a => a.ExamId == examId && a.UserId == userId && a.Status == AttemptStatus.InProgress, ct);

        if (activeAttempt != null)
        {
            if (DateTime.UtcNow >= activeAttempt.ExpiresAt)
            {
                // Expire active attempt
                await FinalizeAttemptInternalAsync(activeAttempt, ct);
            }
            else
            {
                // Resume existing active attempt
                var remaining = (int)Math.Max(0, (activeAttempt.ExpiresAt - DateTime.UtcNow).TotalSeconds);
                return BuildStartResponse(activeAttempt, exam, remaining);
            }
        }

        // Check max attempts count
        var completedCount = await _db.ExamAttempts
            .CountAsync(a => a.ExamId == examId && a.UserId == userId && (a.Status == AttemptStatus.Completed || a.Status == AttemptStatus.Expired), ct);

        if (completedCount >= exam.MaxAttempts)
        {
            throw new ValidationException($"You have reached the maximum allowed attempts ({exam.MaxAttempts}) for this exam.");
        }

        // Create new attempt
        var now = DateTime.UtcNow;
        var expiresAt = now.AddMinutes(exam.DurationMinutes);

        var newAttempt = new ExamAttempt
        {
            ExamId = examId,
            UserId = userId,
            StartedAt = now,
            ExpiresAt = expiresAt,
            Status = AttemptStatus.InProgress,
            TotalPoints = exam.Questions.Sum(q => q.Points)
        };

        _db.ExamAttempts.Add(newAttempt);
        await _db.SaveChangesAsync(ct);

        var remainingSeconds = (int)(expiresAt - now).TotalSeconds;
        return BuildStartResponse(newAttempt, exam, remainingSeconds);
    }

    public async Task<AttemptDetailDto> GetAttemptAsync(Guid attemptId, CancellationToken ct = default)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();
        var attempt = await _db.ExamAttempts
            .Include(a => a.Exam)
                .ThenInclude(e => e.Category)
            .Include(a => a.Exam)
                .ThenInclude(e => e.Questions.OrderBy(q => q.Order))
                    .ThenInclude(q => q.Options.OrderBy(o => o.Order))
            .Include(a => a.Answers)
            .FirstOrDefaultAsync(a => a.Id == attemptId, ct)
            ?? throw new NotFoundException("Attempt", attemptId);

        if (_currentUser.Role != UserRole.Admin && attempt.UserId != userId && attempt.Exam.TeacherId != userId)
        {
            throw new ForbiddenException("You cannot access this attempt.");
        }

        if (attempt.Status == AttemptStatus.InProgress && DateTime.UtcNow >= attempt.ExpiresAt)
        {
            await FinalizeAttemptInternalAsync(attempt, ct);
        }

        var remaining = attempt.Status == AttemptStatus.InProgress 
            ? (int)Math.Max(0, (attempt.ExpiresAt - DateTime.UtcNow).TotalSeconds)
            : 0;

        var savedAnswers = attempt.Answers.Select(a => new SavedAnswerDto
        {
            QuestionId = a.QuestionId,
            SelectedOptionIds = ParseGuidList(a.SelectedOptionIdsJson),
            IsMarkedForReview = a.IsMarkedForReview,
            AnsweredAt = a.AnsweredAt
        }).ToList();

        var questions = attempt.Exam.Questions.Select(q => new ExamTakingQuestionDto
        {
            Id = q.Id,
            Text = q.Text,
            QuestionType = q.QuestionType,
            Points = q.Points,
            Order = q.Order,
            CodeSnippet = q.CodeSnippet,
            Options = q.Options.Select(o => new ExamTakingOptionDto
            {
                Id = o.Id,
                Text = o.Text,
                Order = o.Order
            }).ToList()
        }).ToList();

        return new AttemptDetailDto
        {
            AttemptId = attempt.Id,
            ExamId = attempt.ExamId,
            ExamTitle = attempt.Exam.Title,
            CategoryName = attempt.Exam.Category.NameUz,
            DurationMinutes = attempt.Exam.DurationMinutes,
            TotalQuestions = attempt.Exam.Questions.Count,
            TotalPoints = attempt.TotalPoints,
            PassingScore = attempt.Exam.PassingScore,
            StartedAt = attempt.StartedAt,
            ExpiresAt = attempt.ExpiresAt,
            RemainingSeconds = remaining,
            Status = attempt.Status,
            Questions = questions,
            SavedAnswers = savedAnswers
        };
    }

    public async Task<SavedAnswerDto> SaveAnswerAsync(Guid attemptId, SaveAnswerDto request, CancellationToken ct = default)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();
        var attempt = await _db.ExamAttempts
            .Include(a => a.Answers)
            .Include(a => a.Exam)
                .ThenInclude(e => e.Questions)
            .FirstOrDefaultAsync(a => a.Id == attemptId, ct)
            ?? throw new NotFoundException("Attempt", attemptId);

        if (attempt.UserId != userId)
        {
            throw new ForbiddenException("Cannot save answer for another user's attempt.");
        }

        if (attempt.Status != AttemptStatus.InProgress)
        {
            throw new ValidationException("This exam attempt is no longer active.");
        }

        if (DateTime.UtcNow >= attempt.ExpiresAt)
        {
            await FinalizeAttemptInternalAsync(attempt, ct);
            throw new ValidationException("Exam time has expired. Your attempt has been submitted.");
        }

        var question = attempt.Exam.Questions.FirstOrDefault(q => q.Id == request.QuestionId)
            ?? throw new NotFoundException("Question", request.QuestionId);

        var answer = attempt.Answers.FirstOrDefault(a => a.QuestionId == request.QuestionId);
        if (answer == null)
        {
            answer = new Answer
            {
                ExamAttemptId = attemptId,
                QuestionId = request.QuestionId
            };
            _db.Answers.Add(answer);
            attempt.Answers.Add(answer);
        }

        var cleanOptionIds = request.SelectedOptionIds.Distinct().ToList();
        answer.SelectedOptionIdsJson = JsonSerializer.Serialize(cleanOptionIds);
        answer.IsMarkedForReview = request.IsMarkedForReview;
        answer.AnsweredAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        return new SavedAnswerDto
        {
            QuestionId = answer.QuestionId,
            SelectedOptionIds = cleanOptionIds,
            IsMarkedForReview = answer.IsMarkedForReview,
            AnsweredAt = answer.AnsweredAt
        };
    }

    public async Task<SubmitExamResponse> SubmitExamAsync(Guid attemptId, CancellationToken ct = default)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();
        var attempt = await _db.ExamAttempts
            .Include(a => a.Exam)
                .ThenInclude(e => e.Questions)
                    .ThenInclude(q => q.Options)
            .Include(a => a.Answers)
            .FirstOrDefaultAsync(a => a.Id == attemptId, ct)
            ?? throw new NotFoundException("Attempt", attemptId);

        if (attempt.UserId != userId && _currentUser.Role != UserRole.Admin)
        {
            throw new ForbiddenException("Cannot submit another user's exam attempt.");
        }

        if (attempt.Status == AttemptStatus.Completed)
        {
            // Already submitted, return results
            return BuildSubmitResponse(attempt);
        }

        return await FinalizeAttemptInternalAsync(attempt, ct);
    }

    public async Task<List<StudentAttemptDto>> GetMyAttemptsAsync(CancellationToken ct = default)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();
        return await _db.ExamAttempts
            .AsNoTracking()
            .Include(a => a.Exam)
                .ThenInclude(e => e.Category)
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.StartedAt)
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

    public async Task AutoExpireAttemptsAsync(CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var expiredAttempts = await _db.ExamAttempts
            .Include(a => a.Exam)
                .ThenInclude(e => e.Questions)
                    .ThenInclude(q => q.Options)
            .Include(a => a.Answers)
            .Where(a => a.Status == AttemptStatus.InProgress && a.ExpiresAt <= now)
            .ToListAsync(ct);

        foreach (var attempt in expiredAttempts)
        {
            await FinalizeAttemptInternalAsync(attempt, ct);
        }
    }

    private async Task<SubmitExamResponse> FinalizeAttemptInternalAsync(ExamAttempt attempt, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var questions = attempt.Exam.Questions.ToList();

        int correctCount = 0;
        int incorrectCount = 0;
        int unansweredCount = 0;
        int earnedTotalPoints = 0;

        foreach (var q in questions)
        {
            var answer = attempt.Answers.FirstOrDefault(a => a.QuestionId == q.Id);
            var selectedIds = answer != null ? ParseGuidList(answer.SelectedOptionIdsJson) : new List<Guid>();

            if (selectedIds.Count == 0)
            {
                unansweredCount++;
                if (answer != null)
                {
                    answer.IsCorrect = false;
                    answer.EarnedPoints = 0;
                }
            }
            else
            {
                var correctOptionIds = q.Options.Where(o => o.IsCorrect).Select(o => o.Id).ToHashSet();
                var selectedSet = selectedIds.ToHashSet();

                bool isCorrect = correctOptionIds.SetEquals(selectedSet);

                if (isCorrect)
                {
                    correctCount++;
                    earnedTotalPoints += q.Points;
                    if (answer != null)
                    {
                        answer.IsCorrect = true;
                        answer.EarnedPoints = q.Points;
                    }
                }
                else
                {
                    incorrectCount++;
                    if (answer != null)
                    {
                        answer.IsCorrect = false;
                        answer.EarnedPoints = 0;
                    }
                }
            }
        }

        var totalPoints = questions.Sum(q => q.Points);
        var percentage = totalPoints > 0 
            ? Math.Round((double)earnedTotalPoints / totalPoints * 100, 1) 
            : 0.0;
        var passed = percentage >= attempt.Exam.PassingScore;

        var submittedTime = now > attempt.ExpiresAt ? attempt.ExpiresAt : now;
        var timeSpent = (int)Math.Max(1, (submittedTime - attempt.StartedAt).TotalSeconds);

        attempt.Status = AttemptStatus.Completed;
        attempt.SubmittedAt = submittedTime;
        attempt.TotalPoints = totalPoints;
        attempt.EarnedPoints = earnedTotalPoints;
        attempt.Percentage = percentage;
        attempt.CorrectAnswersCount = correctCount;
        attempt.IncorrectAnswersCount = incorrectCount;
        attempt.UnansweredCount = unansweredCount;
        attempt.Passed = passed;
        attempt.TimeSpentSeconds = timeSpent;
        attempt.UpdatedAt = now;

        await _db.SaveChangesAsync(ct);

        return BuildSubmitResponse(attempt);
    }

    private static SubmitExamResponse BuildSubmitResponse(ExamAttempt attempt)
    {
        return new SubmitExamResponse
        {
            AttemptId = attempt.Id,
            ExamId = attempt.ExamId,
            ExamTitle = attempt.Exam?.Title ?? string.Empty,
            TotalPoints = attempt.TotalPoints,
            EarnedPoints = attempt.EarnedPoints,
            Percentage = attempt.Percentage,
            CorrectAnswersCount = attempt.CorrectAnswersCount,
            IncorrectAnswersCount = attempt.IncorrectAnswersCount,
            UnansweredCount = attempt.UnansweredCount,
            Passed = attempt.Passed,
            PassingScore = attempt.Exam?.PassingScore ?? 60,
            TimeSpentSeconds = attempt.TimeSpentSeconds,
            SubmittedAt = attempt.SubmittedAt ?? DateTime.UtcNow
        };
    }

    private static StartExamResponse BuildStartResponse(ExamAttempt attempt, Exam exam, int remainingSeconds)
    {
        var questions = exam.Questions.Select(q => new ExamTakingQuestionDto
        {
            Id = q.Id,
            Text = q.Text,
            QuestionType = q.QuestionType,
            Points = q.Points,
            Order = q.Order,
            CodeSnippet = q.CodeSnippet,
            Options = q.Options.Select(o => new ExamTakingOptionDto
            {
                Id = o.Id,
                Text = o.Text,
                Order = o.Order
            }).ToList()
        }).ToList();

        var savedAnswers = attempt.Answers.Select(a => new SavedAnswerDto
        {
            QuestionId = a.QuestionId,
            SelectedOptionIds = ParseGuidList(a.SelectedOptionIdsJson),
            IsMarkedForReview = a.IsMarkedForReview,
            AnsweredAt = a.AnsweredAt
        }).ToList();

        return new StartExamResponse
        {
            AttemptId = attempt.Id,
            ExamId = exam.Id,
            ExamTitle = exam.Title,
            CategoryName = exam.Category?.NameUz ?? string.Empty,
            DurationMinutes = exam.DurationMinutes,
            TotalQuestions = questions.Count,
            TotalPoints = attempt.TotalPoints > 0 ? attempt.TotalPoints : exam.Questions.Sum(q => q.Points),
            PassingScore = exam.PassingScore,
            StartedAt = attempt.StartedAt,
            ExpiresAt = attempt.ExpiresAt,
            RemainingSeconds = remainingSeconds,
            Questions = questions,
            SavedAnswers = savedAnswers
        };
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
