using System.Text.Json;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using TestPlatform.Application.Common.Exceptions;
using TestPlatform.Application.DTOs.Attempts;
using TestPlatform.Application.Interfaces;
using TestPlatform.Application.Services;
using TestPlatform.Domain.Entities;
using TestPlatform.Domain.Enums;
using TestPlatform.Infrastructure.Data;
using Xunit;

namespace TestPlatform.UnitTests.ExamEngine;

public class ScoringAndExamEngineTests
{
    private readonly DbContextOptions<AppDbContext> _dbOptions;

    public ScoringAndExamEngineTests()
    {
        _dbOptions = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
    }

    [Fact]
    public async Task StartExam_ShouldCreateAttemptWithServerSideExpiry()
    {
        // Arrange
        using var context = new AppDbContext(_dbOptions);
        var studentId = Guid.NewGuid();

        var category = new Category
        {
            Id = Guid.NewGuid(),
            NameUz = "Algorithms",
            NameRu = "Алгоритмы",
            NameEn = "Algorithms",
            Slug = "algorithms"
        };
        context.Categories.Add(category);

        var exam = new Exam
        {
            Id = Guid.NewGuid(),
            Title = "Algorithms Test",
            CategoryId = category.Id,
            Category = category,
            DurationMinutes = 30,
            PassingScore = 70,
            Status = ExamStatus.Published,
            MaxAttempts = 3,
            TotalPoints = 20,
            Questions = new List<Question>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    Text = "What is the time complexity of binary search?",
                    QuestionType = QuestionType.SingleChoice,
                    Points = 10,
                    Options = new List<QuestionOption>
                    {
                        new() { Id = Guid.NewGuid(), Text = "O(log n)", IsCorrect = true },
                        new() { Id = Guid.NewGuid(), Text = "O(n)", IsCorrect = false }
                    }
                }
            }
        };

        context.Exams.Add(exam);
        await context.SaveChangesAsync();

        var mockUser = new Mock<ICurrentUserService>();
        mockUser.Setup(u => u.UserId).Returns(studentId);
        mockUser.Setup(u => u.Role).Returns(UserRole.Student);
        mockUser.Setup(u => u.IsAuthenticated).Returns(true);

        var attemptService = new AttemptService(context, mockUser.Object);

        // Act
        var response = await attemptService.StartExamAsync(exam.Id);

        // Assert
        response.Should().NotBeNull();
        response.AttemptId.Should().NotBeEmpty();
        response.ExpiresAt.Should().BeCloseTo(DateTime.UtcNow.AddMinutes(30), TimeSpan.FromSeconds(5));
        response.Questions.Should().HaveCount(1);
    }

    [Fact]
    public async Task SubmitExam_ShouldCalculateAccurateScoreAndPassFail()
    {
        // Arrange
        using var context = new AppDbContext(_dbOptions);
        var studentId = Guid.NewGuid();

        var q1_opt1 = new QuestionOption { Id = Guid.NewGuid(), Text = "Option A", IsCorrect = true };
        var q1_opt2 = new QuestionOption { Id = Guid.NewGuid(), Text = "Option B", IsCorrect = false };

        var q2_opt1 = new QuestionOption { Id = Guid.NewGuid(), Text = "Multi A", IsCorrect = true };
        var q2_opt2 = new QuestionOption { Id = Guid.NewGuid(), Text = "Multi B", IsCorrect = true };
        var q2_opt3 = new QuestionOption { Id = Guid.NewGuid(), Text = "Multi C", IsCorrect = false };

        var exam = new Exam
        {
            Id = Guid.NewGuid(),
            Title = "Scoring Test",
            DurationMinutes = 20,
            PassingScore = 50,
            Status = ExamStatus.Published,
            TotalPoints = 20,
            Questions = new List<Question>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    Text = "Q1 Single Choice",
                    Points = 10,
                    QuestionType = QuestionType.SingleChoice,
                    Options = new List<QuestionOption> { q1_opt1, q1_opt2 }
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    Text = "Q2 Multiple Choice",
                    Points = 10,
                    QuestionType = QuestionType.MultipleChoice,
                    Options = new List<QuestionOption> { q2_opt1, q2_opt2, q2_opt3 }
                }
            }
        };

        var attempt = new ExamAttempt
        {
            Id = Guid.NewGuid(),
            ExamId = exam.Id,
            UserId = studentId,
            StartedAt = DateTime.UtcNow.AddMinutes(-5),
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            Status = AttemptStatus.InProgress,
            TotalPoints = 20
        };

        context.Exams.Add(exam);
        context.ExamAttempts.Add(attempt);
        await context.SaveChangesAsync();

        var mockUser = new Mock<ICurrentUserService>();
        mockUser.Setup(u => u.UserId).Returns(studentId);
        mockUser.Setup(u => u.Role).Returns(UserRole.Student);
        mockUser.Setup(u => u.IsAuthenticated).Returns(true);

        var attemptService = new AttemptService(context, mockUser.Object);

        // Student answers Q1 correctly
        await attemptService.SaveAnswerAsync(attempt.Id, new SaveAnswerDto
        {
            QuestionId = exam.Questions.First().Id,
            SelectedOptionIds = new List<Guid> { q1_opt1.Id }
        });

        // Student answers Q2 only partially (only Multi A, missing Multi B) -> Incorrect
        await attemptService.SaveAnswerAsync(attempt.Id, new SaveAnswerDto
        {
            QuestionId = exam.Questions.Last().Id,
            SelectedOptionIds = new List<Guid> { q2_opt1.Id }
        });

        // Act
        var result = await attemptService.SubmitExamAsync(attempt.Id);

        // Assert
        result.Should().NotBeNull();
        result.TotalPoints.Should().Be(20);
        result.EarnedPoints.Should().Be(10); // 10 from Q1, 0 from Q2
        result.Percentage.Should().Be(50.0);
        result.Passed.Should().BeTrue(); // passing score was 50%
        result.CorrectAnswersCount.Should().Be(1);
        result.IncorrectAnswersCount.Should().Be(1);
        result.UnansweredCount.Should().Be(0);
    }

    [Fact]
    public async Task SaveAnswer_WhenAttemptExpired_ShouldThrowValidationException()
    {
        // Arrange
        using var context = new AppDbContext(_dbOptions);
        var studentId = Guid.NewGuid();

        var exam = new Exam
        {
            Id = Guid.NewGuid(),
            Title = "Timed Out Exam",
            DurationMinutes = 10,
            PassingScore = 60,
            Status = ExamStatus.Published,
            TotalPoints = 10,
            Questions = new List<Question>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    Text = "Sample Question",
                    Points = 10,
                    Options = new List<QuestionOption>
                    {
                        new() { Id = Guid.NewGuid(), Text = "A", IsCorrect = true }
                    }
                }
            }
        };

        var expiredAttempt = new ExamAttempt
        {
            Id = Guid.NewGuid(),
            ExamId = exam.Id,
            UserId = studentId,
            StartedAt = DateTime.UtcNow.AddMinutes(-30),
            ExpiresAt = DateTime.UtcNow.AddMinutes(-10), // Expired 10 minutes ago
            Status = AttemptStatus.InProgress,
            TotalPoints = 10
        };

        context.Exams.Add(exam);
        context.ExamAttempts.Add(expiredAttempt);
        await context.SaveChangesAsync();

        var mockUser = new Mock<ICurrentUserService>();
        mockUser.Setup(u => u.UserId).Returns(studentId);
        mockUser.Setup(u => u.Role).Returns(UserRole.Student);
        mockUser.Setup(u => u.IsAuthenticated).Returns(true);

        var attemptService = new AttemptService(context, mockUser.Object);

        // Act & Assert
        Func<Task> act = async () => await attemptService.SaveAnswerAsync(expiredAttempt.Id, new SaveAnswerDto
        {
            QuestionId = exam.Questions.First().Id,
            SelectedOptionIds = new List<Guid>()
        });

        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*expired*");
    }
}
