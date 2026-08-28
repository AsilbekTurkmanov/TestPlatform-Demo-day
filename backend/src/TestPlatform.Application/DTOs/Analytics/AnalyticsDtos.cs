using TestPlatform.Domain.Enums;

namespace TestPlatform.Application.DTOs.Analytics;

public class StudentAnalyticsDto
{
    public int TotalExamsTaken { get; set; }
    public int CompletedExams { get; set; }
    public int PassedExams { get; set; }
    public double PassRate { get; set; }
    public double AverageScore { get; set; }
    public int TotalTimeSpentMinutes { get; set; }
    public string StrongestCategory { get; set; } = "N/A";
    public string WeakestCategory { get; set; } = "N/A";
    public List<ScoreHistoryPoint> ScoreHistory { get; set; } = new();
    public List<CategoryPerformanceDto> CategoryPerformance { get; set; } = new();
    public List<DifficultyPerformanceDto> DifficultyPerformance { get; set; } = new();
}

public class TeacherAnalyticsDto
{
    public int TotalExamsCreated { get; set; }
    public int PublishedExams { get; set; }
    public int TotalStudentAttempts { get; set; }
    public double OverallPassRate { get; set; }
    public double OverallAverageScore { get; set; }
    public List<ExamPerformanceSummaryDto> ExamSummaries { get; set; } = new();
    public List<MissedQuestionDto> MostMissedQuestions { get; set; } = new();
    public List<ScoreDistributionBucketDto> ScoreDistribution { get; set; } = new();
}

public class AdminAnalyticsDto
{
    public int TotalUsers { get; set; }
    public int TotalStudents { get; set; }
    public int TotalTeachers { get; set; }
    public int TotalExams { get; set; }
    public int TotalAttempts { get; set; }
    public int CompletedAttempts { get; set; }
    public double PlatformAverageScore { get; set; }
    public double PlatformPassRate { get; set; }
    public List<UserGrowthPointDto> UserGrowth { get; set; } = new();
    public List<ExamActivityPointDto> ExamActivity { get; set; } = new();
    public List<CategoryShareDto> CategoryDistribution { get; set; } = new();
}

public class ScoreHistoryPoint
{
    public string Date { get; set; } = string.Empty;
    public string ExamTitle { get; set; } = string.Empty;
    public double Score { get; set; }
    public double PassingScore { get; set; }
}

public class CategoryPerformanceDto
{
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryColor { get; set; } = string.Empty;
    public int ExamsTaken { get; set; }
    public double AverageScore { get; set; }
    public double PassRate { get; set; }
}

public class DifficultyPerformanceDto
{
    public ExamDifficulty Difficulty { get; set; }
    public int TotalAttempts { get; set; }
    public double AverageScore { get; set; }
    public double PassRate { get; set; }
}

public class ExamPerformanceSummaryDto
{
    public Guid ExamId { get; set; }
    public string ExamTitle { get; set; } = string.Empty;
    public int AttemptsCount { get; set; }
    public double AverageScore { get; set; }
    public double PassRate { get; set; }
    public int DurationMinutes { get; set; }
}

public class MissedQuestionDto
{
    public Guid QuestionId { get; set; }
    public string ExamTitle { get; set; } = string.Empty;
    public string QuestionText { get; set; } = string.Empty;
    public int TotalAnswers { get; set; }
    public int IncorrectAnswers { get; set; }
    public double MissRate { get; set; }
}

public class ScoreDistributionBucketDto
{
    public string Range { get; set; } = string.Empty; // e.g. "0-20%", "21-40%", ...
    public int Count { get; set; }
    public double Percentage { get; set; }
}

public class UserGrowthPointDto
{
    public string Month { get; set; } = string.Empty;
    public int Students { get; set; }
    public int Teachers { get; set; }
    public int Total { get; set; }
}

public class ExamActivityPointDto
{
    public string Date { get; set; } = string.Empty;
    public int Attempts { get; set; }
    public int Completed { get; set; }
}

public class CategoryShareDto
{
    public string CategoryName { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public int ExamCount { get; set; }
    public int AttemptCount { get; set; }
}
