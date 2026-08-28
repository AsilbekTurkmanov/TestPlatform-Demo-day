using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using TestPlatform.Application.Common.Exceptions;
using TestPlatform.Application.DTOs.Exams;
using TestPlatform.Application.DTOs.Questions;
using TestPlatform.Application.Interfaces;
using TestPlatform.Application.Services;
using TestPlatform.Domain.Entities;
using TestPlatform.Domain.Enums;
using TestPlatform.Infrastructure.Data;
using Xunit;

namespace TestPlatform.UnitTests.ExamEngine;

public class RoleAndExamWorkflowTests
{
    private readonly DbContextOptions<AppDbContext> _dbOptions;

    public RoleAndExamWorkflowTests()
    {
        _dbOptions = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
    }

    [Fact]
    public async Task Student_CannotCreateExam_ThrowsForbiddenException()
    {
        // Arrange
        using var context = new AppDbContext(_dbOptions);
        var studentId = Guid.NewGuid();

        var mockUser = new Mock<ICurrentUserService>();
        mockUser.Setup(u => u.UserId).Returns(studentId);
        mockUser.Setup(u => u.Role).Returns(UserRole.Student);
        mockUser.Setup(u => u.IsAuthenticated).Returns(true);

        var examService = new ExamService(context, mockUser.Object);

        // Act
        Func<Task> act = async () => await examService.CreateExamAsync(new CreateExamDto
        {
            Title = "Unauthorized Exam",
            Description = "Test",
            CategoryId = Guid.NewGuid()
        });

        // Assert
        await act.Should().ThrowAsync<ForbiddenException>()
            .WithMessage("*teachers and admins*");
    }

    [Fact]
    public async Task Teacher_CanCreateAndDuplicateExam()
    {
        // Arrange
        using var context = new AppDbContext(_dbOptions);
        var teacherId = Guid.NewGuid();
        var teacher = new User
        {
            Id = teacherId,
            FullName = "Teacher John",
            Email = "john@test.uz",
            Role = UserRole.Teacher
        };
        var category = new Category
        {
            Id = Guid.NewGuid(),
            NameUz = "Informatika",
            NameRu = "Информатика",
            NameEn = "Computer Science",
            Slug = "cs"
        };
        context.Users.Add(teacher);
        context.Categories.Add(category);
        await context.SaveChangesAsync();

        var mockUser = new Mock<ICurrentUserService>();
        mockUser.Setup(u => u.UserId).Returns(teacherId);
        mockUser.Setup(u => u.Role).Returns(UserRole.Teacher);
        mockUser.Setup(u => u.IsAuthenticated).Returns(true);

        var examService = new ExamService(context, mockUser.Object);

        // Act: Create
        var created = await examService.CreateExamAsync(new CreateExamDto
        {
            Title = "CS101 Intro",
            Description = "Computer Science Basics",
            CategoryId = category.Id,
            Difficulty = ExamDifficulty.Easy,
            DurationMinutes = 20,
            PassingScore = 60
        });

        // Assert
        created.Should().NotBeNull();
        created.Title.Should().Be("CS101 Intro");

        // Act: Duplicate
        var duplicated = await examService.DuplicateExamAsync(created.Id);

        // Assert
        duplicated.Should().NotBeNull();
        duplicated.Title.Should().Be("CS101 Intro (Copy)");
        duplicated.Status.Should().Be(ExamStatus.Draft);
    }
}
