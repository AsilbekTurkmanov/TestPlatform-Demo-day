namespace TestPlatform.Domain.Enums;

public enum UserRole
{
    Student = 1,
    Teacher = 2,
    Admin = 3
}

public enum ExamDifficulty
{
    Easy = 1,
    Medium = 2,
    Hard = 3
}

public enum ExamVisibility
{
    Public = 1,
    Private = 2
}

public enum ExamStatus
{
    Draft = 1,
    Published = 2,
    Archived = 3
}

public enum QuestionType
{
    SingleChoice = 1,
    MultipleChoice = 2,
    TrueFalse = 3
}

public enum AttemptStatus
{
    InProgress = 1,
    Completed = 2,
    Expired = 3,
    Abandoned = 4
}
