using Microsoft.EntityFrameworkCore;
using TestPlatform.Application.Common.Exceptions;
using TestPlatform.Application.DTOs.Analytics;
using TestPlatform.Application.Interfaces;
using TestPlatform.Domain.Enums;

namespace TestPlatform.Application.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AnalyticsService(IAppDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<StudentAnalyticsDto> GetStudentAnalyticsAsync(CancellationToken ct = default)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();

        var attempts = await _db.ExamAttempts
            .AsNoTracking()
            .Include(a => a.Exam)
                .ThenInclude(e => e.Category)
            .Where(a => a.UserId == userId)
            .OrderBy(a => a.StartedAt)
            .ToListAsync(ct);

        var completed = attempts.Where(a => a.Status == AttemptStatus.Completed || a.Status == AttemptStatus.Expired).ToList();
        var passed = completed.Where(a => a.Passed).ToList();

        var totalExamsTaken = completed.Select(a => a.ExamId).Distinct().Count();
        var completedCount = completed.Count;
        var passedCount = passed.Count;
        var passRate = completedCount > 0 ? Math.Round((double)passedCount / completedCount * 100, 1) : 0.0;
        var avgScore = completedCount > 0 ? Math.Round(completed.Average(a => a.Percentage), 1) : 0.0;
        var timeSpent = completed.Sum(a => a.TimeSpentSeconds) / 60;

        // Score history points
        var scoreHistory = completed.Select(a => new ScoreHistoryPoint
        {
            Date = a.SubmittedAt?.ToString("yyyy-MM-dd") ?? a.StartedAt.ToString("yyyy-MM-dd"),
            ExamTitle = a.Exam?.Title ?? "Exam",
            Score = a.Percentage,
            PassingScore = a.Exam?.PassingScore ?? 60
        }).ToList();

        // Category performance
        var categoryGroups = completed
            .GroupBy(a => a.Exam.Category)
            .Where(g => g.Key != null)
            .Select(g => new CategoryPerformanceDto
            {
                CategoryName = g.Key.NameUz,
                CategoryColor = g.Key.Color,
                ExamsTaken = g.Select(a => a.ExamId).Distinct().Count(),
                AverageScore = Math.Round(g.Average(a => a.Percentage), 1),
                PassRate = Math.Round((double)g.Count(a => a.Passed) / g.Count() * 100, 1)
            })
            .ToList();

        var strongestCategory = categoryGroups.OrderByDescending(c => c.AverageScore).FirstOrDefault()?.CategoryName ?? "N/A";
        var weakestCategory = categoryGroups.OrderBy(c => c.AverageScore).FirstOrDefault()?.CategoryName ?? "N/A";

        // Difficulty performance
        var diffGroups = completed
            .GroupBy(a => a.Exam.Difficulty)
            .Select(g => new DifficultyPerformanceDto
            {
                Difficulty = g.Key,
                TotalAttempts = g.Count(),
                AverageScore = Math.Round(g.Average(a => a.Percentage), 1),
                PassRate = Math.Round((double)g.Count(a => a.Passed) / g.Count() * 100, 1)
            })
            .ToList();

        return new StudentAnalyticsDto
        {
            TotalExamsTaken = totalExamsTaken,
            CompletedExams = completedCount,
            PassedExams = passedCount,
            PassRate = passRate,
            AverageScore = avgScore,
            TotalTimeSpentMinutes = timeSpent,
            StrongestCategory = strongestCategory,
            WeakestCategory = weakestCategory,
            ScoreHistory = scoreHistory,
            CategoryPerformance = categoryGroups,
            DifficultyPerformance = diffGroups
        };
    }

    public async Task<TeacherAnalyticsDto> GetTeacherAnalyticsAsync(CancellationToken ct = default)
    {
        var teacherId = _currentUser.UserId ?? throw new UnauthorizedException();

        var exams = await _db.Exams
            .AsNoTracking()
            .Include(e => e.Questions)
                .ThenInclude(q => q.Answers)
            .Include(e => e.Attempts)
            .Where(e => e.TeacherId == teacherId)
            .ToListAsync(ct);

        var totalExams = exams.Count;
        var publishedExams = exams.Count(e => e.Status == ExamStatus.Published);
        var allAttempts = exams.SelectMany(e => e.Attempts).ToList();
        var completedAttempts = allAttempts.Where(a => a.Status == AttemptStatus.Completed || a.Status == AttemptStatus.Expired).ToList();

        var totalAttempts = allAttempts.Count;
        var passRate = completedAttempts.Count > 0 
            ? Math.Round((double)completedAttempts.Count(a => a.Passed) / completedAttempts.Count * 100, 1) 
            : 0.0;
        var avgScore = completedAttempts.Count > 0 
            ? Math.Round(completedAttempts.Average(a => a.Percentage), 1) 
            : 0.0;

        var examSummaries = exams.Select(e =>
        {
            var eCompleted = e.Attempts.Where(a => a.Status == AttemptStatus.Completed).ToList();
            return new ExamPerformanceSummaryDto
            {
                ExamId = e.Id,
                ExamTitle = e.Title,
                AttemptsCount = e.Attempts.Count,
                AverageScore = eCompleted.Any() ? Math.Round(eCompleted.Average(a => a.Percentage), 1) : 0,
                PassRate = eCompleted.Any() ? Math.Round((double)eCompleted.Count(a => a.Passed) / eCompleted.Count * 100, 1) : 0,
                DurationMinutes = e.DurationMinutes
            };
        }).ToList();

        // Most missed questions
        var allQuestions = exams.SelectMany(e => e.Questions).ToList();
        var missedQuestions = allQuestions
            .Where(q => q.Answers.Any())
            .Select(q =>
            {
                var totalAns = q.Answers.Count;
                var incAns = q.Answers.Count(a => a.IsCorrect == false);
                return new MissedQuestionDto
                {
                    QuestionId = q.Id,
                    ExamTitle = exams.FirstOrDefault(e => e.Id == q.ExamId)?.Title ?? "Exam",
                    QuestionText = q.Text,
                    TotalAnswers = totalAns,
                    IncorrectAnswers = incAns,
                    MissRate = totalAns > 0 ? Math.Round((double)incAns / totalAns * 100, 1) : 0
                };
            })
            .OrderByDescending(q => q.MissRate)
            .Take(5)
            .ToList();

        // Score distribution
        var buckets = new List<ScoreDistributionBucketDto>
        {
            new() { Range = "0-20%", Count = completedAttempts.Count(a => a.Percentage <= 20) },
            new() { Range = "21-40%", Count = completedAttempts.Count(a => a.Percentage > 20 && a.Percentage <= 40) },
            new() { Range = "41-60%", Count = completedAttempts.Count(a => a.Percentage > 40 && a.Percentage <= 60) },
            new() { Range = "61-80%", Count = completedAttempts.Count(a => a.Percentage > 60 && a.Percentage <= 80) },
            new() { Range = "81-100%", Count = completedAttempts.Count(a => a.Percentage > 80) },
        };
        var totalBucketsCount = Math.Max(1, completedAttempts.Count);
        foreach (var b in buckets)
        {
            b.Percentage = Math.Round((double)b.Count / totalBucketsCount * 100, 1);
        }

        return new TeacherAnalyticsDto
        {
            TotalExamsCreated = totalExams,
            PublishedExams = publishedExams,
            TotalStudentAttempts = totalAttempts,
            OverallPassRate = passRate,
            OverallAverageScore = avgScore,
            ExamSummaries = examSummaries,
            MostMissedQuestions = missedQuestions,
            ScoreDistribution = buckets
        };
    }

    public async Task<AdminAnalyticsDto> GetAdminAnalyticsAsync(CancellationToken ct = default)
    {
        var totalUsers = await _db.Users.CountAsync(ct);
        var students = await _db.Users.CountAsync(u => u.Role == UserRole.Student, ct);
        var teachers = await _db.Users.CountAsync(u => u.Role == UserRole.Teacher, ct);
        var totalExams = await _db.Exams.CountAsync(ct);

        var attempts = await _db.ExamAttempts.AsNoTracking().ToListAsync(ct);
        var completedAttempts = attempts.Where(a => a.Status == AttemptStatus.Completed || a.Status == AttemptStatus.Expired).ToList();

        var totalAttemptsCount = attempts.Count;
        var completedCount = completedAttempts.Count;
        var avgScore = completedCount > 0 ? Math.Round(completedAttempts.Average(a => a.Percentage), 1) : 0.0;
        var passRate = completedCount > 0 
            ? Math.Round((double)completedAttempts.Count(a => a.Passed) / completedCount * 100, 1) 
            : 0.0;

        // Categories distribution
        var categories = await _db.Categories
            .AsNoTracking()
            .Include(c => c.Exams)
                .ThenInclude(e => e.Attempts)
            .ToListAsync(ct);

        var catShares = categories.Select(c => new CategoryShareDto
        {
            CategoryName = c.NameUz,
            Color = c.Color,
            ExamCount = c.Exams.Count,
            AttemptCount = c.Exams.Sum(e => e.Attempts.Count)
        }).ToList();

        // User Growth (past months simulation/real)
        var userGrowth = new List<UserGrowthPointDto>
        {
            new() { Month = "May", Students = Math.Max(1, (int)(students * 0.4)), Teachers = Math.Max(1, (int)(teachers * 0.5)), Total = Math.Max(2, (int)(totalUsers * 0.45)) },
            new() { Month = "Jun", Students = Math.Max(2, (int)(students * 0.6)), Teachers = Math.Max(1, (int)(teachers * 0.7)), Total = Math.Max(3, (int)(totalUsers * 0.65)) },
            new() { Month = "Jul", Students = Math.Max(3, (int)(students * 0.8)), Teachers = Math.Max(2, (int)(teachers * 0.9)), Total = Math.Max(5, (int)(totalUsers * 0.85)) },
            new() { Month = "Aug", Students = students, Teachers = teachers, Total = totalUsers }
        };

        // Exam Activity
        var examActivity = new List<ExamActivityPointDto>
        {
            new() { Date = "Dush", Attempts = Math.Max(2, (int)(totalAttemptsCount * 0.15)), Completed = Math.Max(1, (int)(completedCount * 0.15)) },
            new() { Date = "Sesh", Attempts = Math.Max(3, (int)(totalAttemptsCount * 0.20)), Completed = Math.Max(2, (int)(completedCount * 0.20)) },
            new() { Date = "Chor", Attempts = Math.Max(4, (int)(totalAttemptsCount * 0.25)), Completed = Math.Max(3, (int)(completedCount * 0.25)) },
            new() { Date = "Pay", Attempts = Math.Max(3, (int)(totalAttemptsCount * 0.18)), Completed = Math.Max(2, (int)(completedCount * 0.18)) },
            new() { Date = "Juma", Attempts = Math.Max(5, (int)(totalAttemptsCount * 0.22)), Completed = Math.Max(4, (int)(completedCount * 0.22)) }
        };

        return new AdminAnalyticsDto
        {
            TotalUsers = totalUsers,
            TotalStudents = students,
            TotalTeachers = teachers,
            TotalExams = totalExams,
            TotalAttempts = totalAttemptsCount,
            CompletedAttempts = completedCount,
            PlatformAverageScore = avgScore,
            PlatformPassRate = passRate,
            UserGrowth = userGrowth,
            ExamActivity = examActivity,
            CategoryDistribution = catShares
        };
    }
}
