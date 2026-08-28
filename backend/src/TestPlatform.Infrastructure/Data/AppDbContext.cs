using Microsoft.EntityFrameworkCore;
using TestPlatform.Application.Interfaces;
using TestPlatform.Domain.Entities;

namespace TestPlatform.Infrastructure.Data;

public class AppDbContext : DbContext, IAppDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Exam> Exams => Set<Exam>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<QuestionOption> QuestionOptions => Set<QuestionOption>();
    public DbSet<ExamAttempt> ExamAttempts => Set<ExamAttempt>();
    public DbSet<Answer> Answers => Set<Answer>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(b =>
        {
            b.HasKey(u => u.Id);
            b.Property(u => u.FullName).IsRequired().HasMaxLength(150);
            b.Property(u => u.Email).IsRequired().HasMaxLength(150);
            b.HasIndex(u => u.Email).IsUnique();
            b.Property(u => u.PasswordHash).IsRequired();
            b.Property(u => u.Role).HasConversion<int>();
        });

        // RefreshToken
        modelBuilder.Entity<RefreshToken>(b =>
        {
            b.HasKey(r => r.Id);
            b.Property(r => r.Token).IsRequired().HasMaxLength(256);
            b.HasIndex(r => r.Token).IsUnique();
            b.HasOne(r => r.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Category
        modelBuilder.Entity<Category>(b =>
        {
            b.HasKey(c => c.Id);
            b.Property(c => c.NameUz).IsRequired().HasMaxLength(150);
            b.Property(c => c.NameRu).IsRequired().HasMaxLength(150);
            b.Property(c => c.NameEn).IsRequired().HasMaxLength(150);
            b.Property(c => c.Slug).IsRequired().HasMaxLength(150);
            b.HasIndex(c => c.Slug).IsUnique();
        });

        // Exam
        modelBuilder.Entity<Exam>(b =>
        {
            b.HasKey(e => e.Id);
            b.Property(e => e.Title).IsRequired().HasMaxLength(250);
            b.Property(e => e.Description).IsRequired().HasMaxLength(4000);
            b.Property(e => e.Difficulty).HasConversion<int>();
            b.Property(e => e.Visibility).HasConversion<int>();
            b.Property(e => e.Status).HasConversion<int>();

            b.HasIndex(e => e.CategoryId);
            b.HasIndex(e => e.TeacherId);
            b.HasIndex(e => e.Status);
            b.HasIndex(e => e.CreatedAt);

            b.HasOne(e => e.Category)
                .WithMany(c => c.Exams)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(e => e.Teacher)
                .WithMany(u => u.CreatedExams)
                .HasForeignKey(e => e.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Question
        modelBuilder.Entity<Question>(b =>
        {
            b.HasKey(q => q.Id);
            b.Property(q => q.Text).IsRequired();
            b.Property(q => q.QuestionType).HasConversion<int>();
            b.HasIndex(q => q.ExamId);

            b.HasOne(q => q.Exam)
                .WithMany(e => e.Questions)
                .HasForeignKey(q => q.ExamId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // QuestionOption
        modelBuilder.Entity<QuestionOption>(b =>
        {
            b.HasKey(o => o.Id);
            b.Property(o => o.Text).IsRequired();
            b.HasIndex(o => o.QuestionId);

            b.HasOne(o => o.Question)
                .WithMany(q => q.Options)
                .HasForeignKey(o => o.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ExamAttempt
        modelBuilder.Entity<ExamAttempt>(b =>
        {
            b.HasKey(a => a.Id);
            b.Property(a => a.Status).HasConversion<int>();

            b.HasIndex(a => a.ExamId);
            b.HasIndex(a => a.UserId);
            b.HasIndex(a => a.StartedAt);

            b.HasOne(a => a.Exam)
                .WithMany(e => e.Attempts)
                .HasForeignKey(a => a.ExamId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(a => a.User)
                .WithMany(u => u.Attempts)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Answer
        modelBuilder.Entity<Answer>(b =>
        {
            b.HasKey(a => a.Id);
            b.Property(a => a.SelectedOptionIdsJson).IsRequired();
            b.HasIndex(a => a.ExamAttemptId);
            b.HasIndex(a => a.QuestionId);

            b.HasOne(a => a.ExamAttempt)
                .WithMany(ea => ea.Answers)
                .HasForeignKey(a => a.ExamAttemptId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(a => a.Question)
                .WithMany(q => q.Answers)
                .HasForeignKey(a => a.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Notification
        modelBuilder.Entity<Notification>(b =>
        {
            b.HasKey(n => n.Id);
            b.HasIndex(n => n.UserId);
            b.HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // AuditLog
        modelBuilder.Entity<AuditLog>(b =>
        {
            b.HasKey(l => l.Id);
            b.HasIndex(l => l.UserId);
            b.HasOne(l => l.User)
                .WithMany(u => u.AuditLogs)
                .HasForeignKey(l => l.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
