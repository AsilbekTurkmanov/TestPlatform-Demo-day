using Microsoft.EntityFrameworkCore;
using TestPlatform.Application.Common;
using TestPlatform.Application.Common.Exceptions;
using TestPlatform.Application.DTOs.Categories;
using TestPlatform.Application.DTOs.Exams;
using TestPlatform.Application.DTOs.Questions;
using TestPlatform.Application.Interfaces;
using TestPlatform.Domain.Entities;
using TestPlatform.Domain.Enums;

namespace TestPlatform.Application.Services;

public class ExamService : IExamService
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ExamService(IAppDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<ExamDto>> GetExamsAsync(ExamFilterDto filter, CancellationToken ct = default)
    {
        var query = _db.Exams
            .AsNoTracking()
            .Include(e => e.Category)
            .Include(e => e.Teacher)
            .Include(e => e.Attempts)
            .AsQueryable();

        // If student or public view, only show Published exams unless filtered explicitly by Teacher
        if (_currentUser.Role == UserRole.Student || !_currentUser.IsAuthenticated)
        {
            query = query.Where(e => e.Status == ExamStatus.Published && e.Visibility == ExamVisibility.Public);
        }
        else if (filter.Status.HasValue)
        {
            query = query.Where(e => e.Status == filter.Status.Value);
        }

        if (filter.CategoryId.HasValue)
        {
            query = query.Where(e => e.CategoryId == filter.CategoryId.Value);
        }

        if (filter.Difficulty.HasValue)
        {
            query = query.Where(e => e.Difficulty == filter.Difficulty.Value);
        }

        if (filter.Visibility.HasValue)
        {
            query = query.Where(e => e.Visibility == filter.Visibility.Value);
        }

        if (filter.TeacherId.HasValue)
        {
            query = query.Where(e => e.TeacherId == filter.TeacherId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim().ToLower();
            query = query.Where(e => e.Title.ToLower().Contains(search) || e.Description.ToLower().Contains(search));
        }

        query = filter.SortBy?.ToLower() switch
        {
            "popular" => query.OrderByDescending(e => e.Attempts.Count),
            "duration" => query.OrderBy(e => e.DurationMinutes),
            "title" => query.OrderBy(e => e.Title),
            _ => query.OrderByDescending(e => e.CreatedAt)
        };

        var totalCount = await query.CountAsync(ct);
        var items = await query
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(e => new ExamDto
            {
                Id = e.Id,
                Title = e.Title,
                Description = e.Description,
                CategoryId = e.CategoryId,
                CategoryName = e.Category.NameUz,
                CategoryColor = e.Category.Color,
                CategoryIcon = e.Category.Icon,
                TeacherId = e.TeacherId,
                TeacherName = e.Teacher.FullName,
                Difficulty = e.Difficulty,
                DurationMinutes = e.DurationMinutes,
                PassingScore = e.PassingScore,
                Visibility = e.Visibility,
                Status = e.Status,
                TotalQuestions = e.TotalQuestions,
                TotalPoints = e.TotalPoints,
                MaxAttempts = e.MaxAttempts,
                ParticipantCount = e.Attempts.Select(a => a.UserId).Distinct().Count(),
                AverageScore = e.Attempts.Where(a => a.Status == AttemptStatus.Completed).Any()
                    ? e.Attempts.Where(a => a.Status == AttemptStatus.Completed).Average(a => a.Percentage)
                    : 0,
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt
            })
            .ToListAsync(ct);

        return new PagedResult<ExamDto>(items, totalCount, filter.PageNumber, filter.PageSize);
    }

    public async Task<ExamDetailDto> GetExamByIdAsync(Guid id, CancellationToken ct = default)
    {
        var exam = await _db.Exams
            .AsNoTracking()
            .Include(e => e.Category)
            .Include(e => e.Teacher)
            .Include(e => e.Questions.OrderBy(q => q.Order))
                .ThenInclude(q => q.Options.OrderBy(o => o.Order))
            .Include(e => e.Attempts)
            .FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException("Exam", id);

        var isOwnerOrAdmin = _currentUser.Role == UserRole.Admin || _currentUser.UserId == exam.TeacherId;

        // If not owner/admin and exam is not published, forbid
        if (!isOwnerOrAdmin && exam.Status != ExamStatus.Published)
        {
            throw new ForbiddenException("Exam is not published.");
        }

        var userId = _currentUser.UserId;
        var userAttempts = userId.HasValue
            ? exam.Attempts.Where(a => a.UserId == userId.Value && a.Status == AttemptStatus.Completed).ToList()
            : new List<ExamAttempt>();

        var dto = new ExamDetailDto
        {
            Id = exam.Id,
            Title = exam.Title,
            Description = exam.Description,
            CategoryId = exam.CategoryId,
            CategoryName = exam.Category.NameUz,
            CategoryColor = exam.Category.Color,
            CategoryIcon = exam.Category.Icon,
            TeacherId = exam.TeacherId,
            TeacherName = exam.Teacher.FullName,
            Difficulty = exam.Difficulty,
            DurationMinutes = exam.DurationMinutes,
            PassingScore = exam.PassingScore,
            Visibility = exam.Visibility,
            Status = exam.Status,
            TotalQuestions = exam.TotalQuestions,
            TotalPoints = exam.TotalPoints,
            MaxAttempts = exam.MaxAttempts,
            ParticipantCount = exam.Attempts.Select(a => a.UserId).Distinct().Count(),
            AverageScore = exam.Attempts.Where(a => a.Status == AttemptStatus.Completed).Any()
                ? exam.Attempts.Where(a => a.Status == AttemptStatus.Completed).Average(a => a.Percentage)
                : 0,
            CreatedAt = exam.CreatedAt,
            UpdatedAt = exam.UpdatedAt,
            Category = new CategoryDto
            {
                Id = exam.Category.Id,
                NameUz = exam.Category.NameUz,
                NameRu = exam.Category.NameRu,
                NameEn = exam.Category.NameEn,
                Slug = exam.Category.Slug,
                DescriptionUz = exam.Category.DescriptionUz,
                DescriptionRu = exam.Category.DescriptionRu,
                DescriptionEn = exam.Category.DescriptionEn,
                Icon = exam.Category.Icon,
                Color = exam.Category.Color,
                DisplayOrder = exam.Category.DisplayOrder,
                IsActive = exam.Category.IsActive
            },
            HasUserAttempted = userAttempts.Any(),
            UserAttemptsCount = userAttempts.Count,
            BestScore = userAttempts.Any() ? userAttempts.Max(a => a.Percentage) : null
        };

        // Only include questions with answers for teacher/admin or hide correct answers for students
        if (isOwnerOrAdmin)
        {
            dto.Questions = exam.Questions.Select(q => new QuestionDto
            {
                Id = q.Id,
                ExamId = q.ExamId,
                Text = q.Text,
                QuestionType = q.QuestionType,
                Points = q.Points,
                Order = q.Order,
                Explanation = q.Explanation,
                CodeSnippet = q.CodeSnippet,
                Options = q.Options.Select(o => new QuestionOptionDto
                {
                    Id = o.Id,
                    QuestionId = o.QuestionId,
                    Text = o.Text,
                    IsCorrect = o.IsCorrect,
                    Order = o.Order
                }).ToList()
            }).ToList();
        }

        return dto;
    }

    public async Task<ExamDto> CreateExamAsync(CreateExamDto request, CancellationToken ct = default)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();
        if (_currentUser.Role != UserRole.Teacher && _currentUser.Role != UserRole.Admin)
        {
            throw new ForbiddenException("Only teachers and admins can create exams.");
        }

        var categoryExists = await _db.Categories.AnyAsync(c => c.Id == request.CategoryId, ct);
        if (!categoryExists)
        {
            throw new NotFoundException("Category", request.CategoryId);
        }

        var exam = new Exam
        {
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            CategoryId = request.CategoryId,
            TeacherId = userId,
            Difficulty = request.Difficulty,
            DurationMinutes = request.DurationMinutes,
            PassingScore = request.PassingScore,
            Visibility = request.Visibility,
            Status = request.Status,
            MaxAttempts = request.MaxAttempts,
            TotalQuestions = 0,
            TotalPoints = 0
        };

        _db.Exams.Add(exam);
        await _db.SaveChangesAsync(ct);

        return await GetExamSummaryDtoAsync(exam.Id, ct);
    }

    public async Task<ExamDto> UpdateExamAsync(Guid id, UpdateExamDto request, CancellationToken ct = default)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();
        var exam = await _db.Exams.FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException("Exam", id);

        if (_currentUser.Role != UserRole.Admin && exam.TeacherId != userId)
        {
            throw new ForbiddenException("You do not have permission to edit this exam.");
        }

        exam.Title = request.Title.Trim();
        exam.Description = request.Description.Trim();
        exam.CategoryId = request.CategoryId;
        exam.Difficulty = request.Difficulty;
        exam.DurationMinutes = request.DurationMinutes;
        exam.PassingScore = request.PassingScore;
        exam.Visibility = request.Visibility;
        exam.Status = request.Status;
        exam.MaxAttempts = request.MaxAttempts;
        exam.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return await GetExamSummaryDtoAsync(exam.Id, ct);
    }

    public async Task DeleteExamAsync(Guid id, CancellationToken ct = default)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();
        var exam = await _db.Exams.FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException("Exam", id);

        if (_currentUser.Role != UserRole.Admin && exam.TeacherId != userId)
        {
            throw new ForbiddenException("You do not have permission to delete this exam.");
        }

        _db.Exams.Remove(exam);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<ExamDto> PublishExamAsync(Guid id, CancellationToken ct = default)
    {
        var exam = await _db.Exams.Include(e => e.Questions).FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException("Exam", id);

        var userId = _currentUser.UserId ?? throw new UnauthorizedException();
        if (_currentUser.Role != UserRole.Admin && exam.TeacherId != userId)
        {
            throw new ForbiddenException("You do not have permission to publish this exam.");
        }

        if (!exam.Questions.Any())
        {
            throw new ValidationException("Cannot publish an exam with no questions. Please add at least one question.");
        }

        exam.Status = ExamStatus.Published;
        exam.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return await GetExamSummaryDtoAsync(exam.Id, ct);
    }

    public async Task<ExamDto> UnpublishExamAsync(Guid id, CancellationToken ct = default)
    {
        var exam = await _db.Exams.FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException("Exam", id);

        var userId = _currentUser.UserId ?? throw new UnauthorizedException();
        if (_currentUser.Role != UserRole.Admin && exam.TeacherId != userId)
        {
            throw new ForbiddenException("You do not have permission to unpublish this exam.");
        }

        exam.Status = ExamStatus.Draft;
        exam.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return await GetExamSummaryDtoAsync(exam.Id, ct);
    }

    public async Task<ExamDto> DuplicateExamAsync(Guid id, CancellationToken ct = default)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();
        var original = await _db.Exams
            .Include(e => e.Questions)
                .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException("Exam", id);

        var duplicate = new Exam
        {
            Title = $"{original.Title} (Copy)",
            Description = original.Description,
            CategoryId = original.CategoryId,
            TeacherId = userId,
            Difficulty = original.Difficulty,
            DurationMinutes = original.DurationMinutes,
            PassingScore = original.PassingScore,
            Visibility = ExamVisibility.Private,
            Status = ExamStatus.Draft,
            TotalQuestions = original.TotalQuestions,
            TotalPoints = original.TotalPoints,
            MaxAttempts = original.MaxAttempts
        };

        foreach (var q in original.Questions)
        {
            var newQ = new Question
            {
                Text = q.Text,
                QuestionType = q.QuestionType,
                Points = q.Points,
                Order = q.Order,
                Explanation = q.Explanation,
                CodeSnippet = q.CodeSnippet
            };

            foreach (var opt in q.Options)
            {
                newQ.Options.Add(new QuestionOption
                {
                    Text = opt.Text,
                    IsCorrect = opt.IsCorrect,
                    Order = opt.Order
                });
            }

            duplicate.Questions.Add(newQ);
        }

        _db.Exams.Add(duplicate);
        await _db.SaveChangesAsync(ct);

        return await GetExamSummaryDtoAsync(duplicate.Id, ct);
    }

    public async Task<List<ExamDto>> GetTeacherExamsAsync(Guid? teacherId = null, CancellationToken ct = default)
    {
        var targetTeacherId = teacherId ?? _currentUser.UserId ?? throw new UnauthorizedException();
        
        return await _db.Exams
            .AsNoTracking()
            .Include(e => e.Category)
            .Include(e => e.Teacher)
            .Include(e => e.Attempts)
            .Where(e => e.TeacherId == targetTeacherId)
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => new ExamDto
            {
                Id = e.Id,
                Title = e.Title,
                Description = e.Description,
                CategoryId = e.CategoryId,
                CategoryName = e.Category.NameUz,
                CategoryColor = e.Category.Color,
                CategoryIcon = e.Category.Icon,
                TeacherId = e.TeacherId,
                TeacherName = e.Teacher.FullName,
                Difficulty = e.Difficulty,
                DurationMinutes = e.DurationMinutes,
                PassingScore = e.PassingScore,
                Visibility = e.Visibility,
                Status = e.Status,
                TotalQuestions = e.TotalQuestions,
                TotalPoints = e.TotalPoints,
                MaxAttempts = e.MaxAttempts,
                ParticipantCount = e.Attempts.Select(a => a.UserId).Distinct().Count(),
                AverageScore = e.Attempts.Where(a => a.Status == AttemptStatus.Completed).Any()
                    ? e.Attempts.Where(a => a.Status == AttemptStatus.Completed).Average(a => a.Percentage)
                    : 0,
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt
            })
            .ToListAsync(ct);
    }

    private async Task<ExamDto> GetExamSummaryDtoAsync(Guid examId, CancellationToken ct)
    {
        return await _db.Exams
            .AsNoTracking()
            .Include(e => e.Category)
            .Include(e => e.Teacher)
            .Include(e => e.Attempts)
            .Where(e => e.Id == examId)
            .Select(e => new ExamDto
            {
                Id = e.Id,
                Title = e.Title,
                Description = e.Description,
                CategoryId = e.CategoryId,
                CategoryName = e.Category.NameUz,
                CategoryColor = e.Category.Color,
                CategoryIcon = e.Category.Icon,
                TeacherId = e.TeacherId,
                TeacherName = e.Teacher.FullName,
                Difficulty = e.Difficulty,
                DurationMinutes = e.DurationMinutes,
                PassingScore = e.PassingScore,
                Visibility = e.Visibility,
                Status = e.Status,
                TotalQuestions = e.TotalQuestions,
                TotalPoints = e.TotalPoints,
                MaxAttempts = e.MaxAttempts,
                ParticipantCount = e.Attempts.Select(a => a.UserId).Distinct().Count(),
                AverageScore = e.Attempts.Where(a => a.Status == AttemptStatus.Completed).Any()
                    ? e.Attempts.Where(a => a.Status == AttemptStatus.Completed).Average(a => a.Percentage)
                    : 0,
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt
            })
            .FirstAsync(ct);
    }
}
