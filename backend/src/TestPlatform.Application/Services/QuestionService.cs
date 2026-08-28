using Microsoft.EntityFrameworkCore;
using TestPlatform.Application.Common.Exceptions;
using TestPlatform.Application.DTOs.Questions;
using TestPlatform.Application.Interfaces;
using TestPlatform.Domain.Entities;
using TestPlatform.Domain.Enums;

namespace TestPlatform.Application.Services;

public class QuestionService : IQuestionService
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public QuestionService(IAppDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<QuestionDto>> GetExamQuestionsAsync(Guid examId, CancellationToken ct = default)
    {
        var exam = await _db.Exams.AsNoTracking().FirstOrDefaultAsync(e => e.Id == examId, ct)
            ?? throw new NotFoundException("Exam", examId);

        var userId = _currentUser.UserId;
        var isOwnerOrAdmin = _currentUser.Role == UserRole.Admin || (_currentUser.Role == UserRole.Teacher && exam.TeacherId == userId);

        var questions = await _db.Questions
            .AsNoTracking()
            .Include(q => q.Options.OrderBy(o => o.Order))
            .Where(q => q.ExamId == examId)
            .OrderBy(q => q.Order)
            .ToListAsync(ct);

        return questions.Select(q => new QuestionDto
        {
            Id = q.Id,
            ExamId = q.ExamId,
            Text = q.Text,
            QuestionType = q.QuestionType,
            Points = q.Points,
            Order = q.Order,
            Explanation = isOwnerOrAdmin ? q.Explanation : null,
            CodeSnippet = q.CodeSnippet,
            Options = q.Options.Select(o => new QuestionOptionDto
            {
                Id = o.Id,
                QuestionId = o.QuestionId,
                Text = o.Text,
                IsCorrect = isOwnerOrAdmin && o.IsCorrect,
                Order = o.Order
            }).ToList()
        }).ToList();
    }

    public async Task<QuestionDto> GetQuestionByIdAsync(Guid id, CancellationToken ct = default)
    {
        var question = await _db.Questions
            .AsNoTracking()
            .Include(q => q.Options.OrderBy(o => o.Order))
            .FirstOrDefaultAsync(q => q.Id == id, ct)
            ?? throw new NotFoundException("Question", id);

        return new QuestionDto
        {
            Id = question.Id,
            ExamId = question.ExamId,
            Text = question.Text,
            QuestionType = question.QuestionType,
            Points = question.Points,
            Order = question.Order,
            Explanation = question.Explanation,
            CodeSnippet = question.CodeSnippet,
            Options = question.Options.Select(o => new QuestionOptionDto
            {
                Id = o.Id,
                QuestionId = o.QuestionId,
                Text = o.Text,
                IsCorrect = o.IsCorrect,
                Order = o.Order
            }).ToList()
        };
    }

    public async Task<QuestionDto> CreateQuestionAsync(Guid examId, CreateQuestionDto request, CancellationToken ct = default)
    {
        var exam = await _db.Exams
            .Include(e => e.Questions)
            .FirstOrDefaultAsync(e => e.Id == examId, ct)
            ?? throw new NotFoundException("Exam", examId);

        var userId = _currentUser.UserId ?? throw new UnauthorizedException();
        if (_currentUser.Role != UserRole.Admin && exam.TeacherId != userId)
        {
            throw new ForbiddenException("You do not have permission to add questions to this exam.");
        }

        if (!request.Options.Any(o => o.IsCorrect))
        {
            throw new ValidationException("At least one option must be marked as correct.");
        }

        var nextOrder = exam.Questions.Any() ? exam.Questions.Max(q => q.Order) + 1 : 1;

        var question = new Question
        {
            ExamId = examId,
            Text = request.Text.Trim(),
            QuestionType = request.QuestionType,
            Points = request.Points > 0 ? request.Points : 10,
            Order = request.Order > 0 ? request.Order : nextOrder,
            Explanation = request.Explanation?.Trim(),
            CodeSnippet = request.CodeSnippet?.Trim()
        };

        int optOrder = 1;
        foreach (var opt in request.Options)
        {
            question.Options.Add(new QuestionOption
            {
                Text = opt.Text.Trim(),
                IsCorrect = opt.IsCorrect,
                Order = opt.Order > 0 ? opt.Order : optOrder++
            });
        }

        _db.Questions.Add(question);
        await _db.SaveChangesAsync(ct);

        await UpdateExamTotalsAsync(examId, ct);

        return await GetQuestionByIdAsync(question.Id, ct);
    }

    public async Task<QuestionDto> UpdateQuestionAsync(Guid id, UpdateQuestionDto request, CancellationToken ct = default)
    {
        var question = await _db.Questions
            .Include(q => q.Options)
            .Include(q => q.Exam)
            .FirstOrDefaultAsync(q => q.Id == id, ct)
            ?? throw new NotFoundException("Question", id);

        var userId = _currentUser.UserId ?? throw new UnauthorizedException();
        if (_currentUser.Role != UserRole.Admin && question.Exam.TeacherId != userId)
        {
            throw new ForbiddenException("You do not have permission to edit this question.");
        }

        if (!request.Options.Any(o => o.IsCorrect))
        {
            throw new ValidationException("At least one option must be marked as correct.");
        }

        question.Text = request.Text.Trim();
        question.QuestionType = request.QuestionType;
        question.Points = request.Points > 0 ? request.Points : 10;
        question.Order = request.Order;
        question.Explanation = request.Explanation?.Trim();
        question.CodeSnippet = request.CodeSnippet?.Trim();
        question.UpdatedAt = DateTime.UtcNow;

        // Sync options
        _db.QuestionOptions.RemoveRange(question.Options);

        int optOrder = 1;
        foreach (var opt in request.Options)
        {
            question.Options.Add(new QuestionOption
            {
                QuestionId = question.Id,
                Text = opt.Text.Trim(),
                IsCorrect = opt.IsCorrect,
                Order = opt.Order > 0 ? opt.Order : optOrder++
            });
        }

        await _db.SaveChangesAsync(ct);
        await UpdateExamTotalsAsync(question.ExamId, ct);

        return await GetQuestionByIdAsync(question.Id, ct);
    }

    public async Task DeleteQuestionAsync(Guid id, CancellationToken ct = default)
    {
        var question = await _db.Questions
            .Include(q => q.Exam)
            .FirstOrDefaultAsync(q => q.Id == id, ct)
            ?? throw new NotFoundException("Question", id);

        var userId = _currentUser.UserId ?? throw new UnauthorizedException();
        if (_currentUser.Role != UserRole.Admin && question.Exam.TeacherId != userId)
        {
            throw new ForbiddenException("You do not have permission to delete this question.");
        }

        var examId = question.ExamId;
        _db.Questions.Remove(question);
        await _db.SaveChangesAsync(ct);

        await UpdateExamTotalsAsync(examId, ct);
    }

    public async Task ReorderQuestionsAsync(Guid examId, ReorderQuestionsDto request, CancellationToken ct = default)
    {
        var exam = await _db.Exams.FirstOrDefaultAsync(e => e.Id == examId, ct)
            ?? throw new NotFoundException("Exam", examId);

        var userId = _currentUser.UserId ?? throw new UnauthorizedException();
        if (_currentUser.Role != UserRole.Admin && exam.TeacherId != userId)
        {
            throw new ForbiddenException("You do not have permission to modify this exam.");
        }

        var questions = await _db.Questions.Where(q => q.ExamId == examId).ToListAsync(ct);
        foreach (var item in request.Items)
        {
            var q = questions.FirstOrDefault(x => x.Id == item.QuestionId);
            if (q != null)
            {
                q.Order = item.Order;
            }
        }

        await _db.SaveChangesAsync(ct);
    }

    private async Task UpdateExamTotalsAsync(Guid examId, CancellationToken ct)
    {
        var exam = await _db.Exams.Include(e => e.Questions).FirstOrDefaultAsync(e => e.Id == examId, ct);
        if (exam != null)
        {
            exam.TotalQuestions = exam.Questions.Count;
            exam.TotalPoints = exam.Questions.Sum(q => q.Points);
            exam.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);
        }
    }
}
