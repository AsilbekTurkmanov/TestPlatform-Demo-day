using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TestPlatform.Application.Interfaces;
using TestPlatform.Domain.Entities;
using TestPlatform.Domain.Enums;
using TestPlatform.Infrastructure.Data;

namespace TestPlatform.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context, IPasswordHasherService passwordHasher)
    {
        // Check if data already exists
        if (await context.Users.AnyAsync())
        {
            return;
        }

        // 1. Seed Users
        var admin = new User
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            FullName = "Admin Boshqaruvchi",
            Email = "admin@testplatform.uz",
            PasswordHash = passwordHasher.HashPassword("Admin123!"),
            Role = UserRole.Admin,
            IsActive = true,
            PhoneNumber = "+998 90 123 45 67",
            Bio = "TestPlatform bosh administratori va tizim nazoratchisi.",
            AvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
        };

        var teacher = new User
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            FullName = "Prof. Alisher Qodirov",
            Email = "teacher@testplatform.uz",
            PasswordHash = passwordHasher.HashPassword("Teacher123!"),
            Role = UserRole.Teacher,
            IsActive = true,
            PhoneNumber = "+998 93 987 65 43",
            Bio = "Dasturlash va axborot texnologiyalari bo'yicha katta o'qituvchi.",
            AvatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
        };

        var student1 = new User
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            FullName = "Jasur Bekmurodov",
            Email = "student@testplatform.uz",
            PasswordHash = passwordHasher.HashPassword("Student123!"),
            Role = UserRole.Student,
            IsActive = true,
            PhoneNumber = "+998 97 111 22 33",
            Bio = "TATU talabasi, Full-stack dasturchilikka qiziquvchi.",
            AvatarUrl = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
        };

        var student2 = new User
        {
            Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
            FullName = "Aziza Karimova",
            Email = "aziza@testplatform.uz",
            PasswordHash = passwordHasher.HashPassword("Student123!"),
            Role = UserRole.Student,
            IsActive = true,
            PhoneNumber = "+998 99 444 55 66",
            Bio = "Ingliz tili va axborot xavfsizligi yo'nalishi talabasi.",
            AvatarUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
        };

        context.Users.AddRange(admin, teacher, student1, student2);

        // 2. Seed Categories
        var catIt = new Category
        {
            Id = Guid.Parse("a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            NameUz = "IT & Dasturlash",
            NameRu = "IT и Программирование",
            NameEn = "IT & Programming",
            Slug = "it-programming",
            DescriptionUz = "C#, .NET, JavaScript, React, Ma'lumotlar bazasi va zamonaviy web texnologiyalari.",
            DescriptionRu = "C#, .NET, JavaScript, React, Базы данных и современные веб-технологии.",
            DescriptionEn = "C#, .NET, JavaScript, React, Databases and modern web technologies.",
            Icon = "Code2",
            Color = "#3B82F6",
            DisplayOrder = 1,
            IsActive = true
        };

        var catMath = new Category
        {
            Id = Guid.Parse("a2222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            NameUz = "Matematika & Mantiq",
            NameRu = "Математика и Логика",
            NameEn = "Mathematics & Logic",
            Slug = "mathematics-logic",
            DescriptionUz = "Oliy matematika, chiziqli algebra, kombinatorika va mantiqiy masalalar.",
            DescriptionRu = "Высшая математика, линейная алгебра, комбинаторика и логика.",
            DescriptionEn = "Higher mathematics, linear algebra, combinatorics and logic.",
            Icon = "Binary",
            Color = "#10B981",
            DisplayOrder = 2,
            IsActive = true
        };

        var catEnglish = new Category
        {
            Id = Guid.Parse("a3333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            NameUz = "Ingliz tili (IELTS / CEFR)",
            NameRu = "Английский язык (IELTS / CEFR)",
            NameEn = "English Language (IELTS / CEFR)",
            Slug = "english-language",
            DescriptionUz = "Grammatika, so'z boyligi, Reading va Writing bo'yicha maxsus testlar.",
            DescriptionRu = "Грамматика, лексика, тесты по чтению и письму.",
            DescriptionEn = "Grammar, vocabulary, reading and writing assessments.",
            Icon = "Languages",
            Color = "#8B5CF6",
            DisplayOrder = 3,
            IsActive = true
        };

        var catPhysics = new Category
        {
            Id = Guid.Parse("a4444444-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            NameUz = "Fizika & Muhandislik",
            NameRu = "Физика и Инженерия",
            NameEn = "Physics & Engineering",
            Slug = "physics-engineering",
            DescriptionUz = "Mexanika, termodinamika, elektrodinamika va kvant fizikasi asoslari.",
            DescriptionRu = "Основы механики, термодинамики, электродинамики и квантовой физики.",
            DescriptionEn = "Fundamentals of mechanics, thermodynamics, and quantum physics.",
            Icon = "Atom",
            Color = "#F59E0B",
            DisplayOrder = 4,
            IsActive = true
        };

        context.Categories.AddRange(catIt, catMath, catEnglish, catPhysics);

        // 3. Seed Exam 1: C# & .NET 10 Dasturlash
        var examCSharp = new Exam
        {
            Id = Guid.Parse("e1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
            Title = "C# va .NET 10 Dasturlash Asoslari",
            Description = "C# 13/.NET 10 ning yangi xususiyatlari, LINQ, Async/Await, Entity Framework Core va Dependency Injection mavzulari bo'yicha chuqurlashtirilgan test.",
            CategoryId = catIt.Id,
            TeacherId = teacher.Id,
            Difficulty = ExamDifficulty.Medium,
            DurationMinutes = 20,
            PassingScore = 60,
            Visibility = ExamVisibility.Public,
            Status = ExamStatus.Published,
            TotalQuestions = 4,
            TotalPoints = 40,
            MaxAttempts = 3,
            CreatedAt = DateTime.UtcNow.AddDays(-10)
        };

        // Question 1: Async/Await
        var q1 = new Question
        {
            Id = Guid.NewGuid(),
            ExamId = examCSharp.Id,
            Text = "C# da 'async/await' mexanizmi qanday ishlaydi va qaysi qatorda Thread bloklanmaydi?",
            QuestionType = QuestionType.SingleChoice,
            Points = 10,
            Order = 1,
            Explanation = "'await' kalit so'zi asinxron operatsiya tugashini kutayotganda joriy Threadni bo'shatadi va ThreadPoolga qaytaradi.",
            CodeSnippet = "public async Task<string> GetDataAsync()\n{\n    var data = await _httpClient.GetStringAsync(url);\n    return data;\n}"
        };
        var q1_o1 = new QuestionOption { Id = Guid.NewGuid(), Text = "await operatsiyasi joriy oqimni (Thread) to'xtatmaydi va uni qayta ishlatish uchun ThreadPoolga qaytaradi.", IsCorrect = true, Order = 1 };
        var q1_o2 = new QuestionOption { Id = Guid.NewGuid(), Text = "await operatsiyasi doimo yangi OS Thread yaratadi va uni bloklaydi.", IsCorrect = false, Order = 2 };
        var q1_o3 = new QuestionOption { Id = Guid.NewGuid(), Text = "async faqat konsol dasturlarida ishlatiladi.", IsCorrect = false, Order = 3 };
        var q1_o4 = new QuestionOption { Id = Guid.NewGuid(), Text = "await funksiya ichida faqat bitta marta chaqirilishi mumkin.", IsCorrect = false, Order = 4 };
        q1.Options = new List<QuestionOption> { q1_o1, q1_o2, q1_o3, q1_o4 };

        // Question 2: Record Types in C#
        var q2 = new Question
        {
            Id = Guid.NewGuid(),
            ExamId = examCSharp.Id,
            Text = "C# da 'record' turlarining 'class' lardan asosiy farqlari qaysilar? (Ko'p tanlovli)",
            QuestionType = QuestionType.MultipleChoice,
            Points = 10,
            Order = 2,
            Explanation = "Record turlari standart qiymat bo'yicha tenglikni (value-based equality) va 'with' ifodasi orqali non-destructive o'zgarishni qo'llab-quvvatlaydi.",
            CodeSnippet = "public record Person(string Name, int Age);"
        };
        var q2_o1 = new QuestionOption { Id = Guid.NewGuid(), Text = "Standart holatda qiymat bo'yicha tenglik (value-based equality) ta'minlanadi.", IsCorrect = true, Order = 1 };
        var q2_o2 = new QuestionOption { Id = Guid.NewGuid(), Text = "'with' ifodasi yordamida o'zgarmas (immutable) nusxa yaratish mumkin.", IsCorrect = true, Order = 2 };
        var q2_o3 = new QuestionOption { Id = Guid.NewGuid(), Text = "Record turlarida xotira ajratilmaydi.", IsCorrect = false, Order = 3 };
        var q2_o4 = new QuestionOption { Id = Guid.NewGuid(), Text = "Record turlari faqat struct sifatida e'lon qilinishi shart.", IsCorrect = false, Order = 4 };
        q2.Options = new List<QuestionOption> { q2_o1, q2_o2, q2_o3, q2_o4 };

        // Question 3: EF Core AsNoTracking
        var q3 = new Question
        {
            Id = Guid.NewGuid(),
            ExamId = examCSharp.Id,
            Text = "Entity Framework Core da 'AsNoTracking()' metodi faqat o'qish (read-only) so'rovlarida tezlikni oshiradi va xotira sarfini kamaytiradi.",
            QuestionType = QuestionType.TrueFalse,
            Points = 10,
            Order = 3,
            Explanation = "To'g'ri. AsNoTracking() o'zgarishlarni kuzatish (Change Tracker) yukini olib tashlaydi va so'rov unumdorligini sezilarli oshiradi."
        };
        var q3_o1 = new QuestionOption { Id = Guid.NewGuid(), Text = "Rost (To'g'ri)", IsCorrect = true, Order = 1 };
        var q3_o2 = new QuestionOption { Id = Guid.NewGuid(), Text = "Yolg'on (Noto'g'ri)", IsCorrect = false, Order = 2 };
        q3.Options = new List<QuestionOption> { q3_o1, q3_o2 };

        // Question 4: Dependency Injection Lifetimes
        var q4 = new Question
        {
            Id = Guid.NewGuid(),
            ExamId = examCSharp.Id,
            Text = "ASP.NET Core da 'AddScoped' xizmatining ishlash muddati (lifetime) qanday belgilanadi?",
            QuestionType = QuestionType.SingleChoice,
            Points = 10,
            Order = 4,
            Explanation = "Scoped xizmatlar har bir HTTP so'rov (request) uchun bir marta yaratiladi va so'rov davomida qayta ishlatiladi."
        };
        var q4_o1 = new QuestionOption { Id = Guid.NewGuid(), Text = "Har bir HTTP so'rovi (request) uchun bitta nusxa yaratiladi.", IsCorrect = true, Order = 1 };
        var q4_o2 = new QuestionOption { Id = Guid.NewGuid(), Text = "Ilova ishga tushganda bir marta yaratiladi va butun ilova bo'ylab bitta bo'ladi.", IsCorrect = false, Order = 2 };
        var q4_o3 = new QuestionOption { Id = Guid.NewGuid(), Text = "Har safar so'ralganda yangi nusxa yaratiladi.", IsCorrect = false, Order = 3 };
        var q4_o4 = new QuestionOption { Id = Guid.NewGuid(), Text = "Faqat bir marta ma'lumotlar bazasi ulanganda yaratiladi.", IsCorrect = false, Order = 4 };
        q4.Options = new List<QuestionOption> { q4_o1, q4_o2, q4_o3, q4_o4 };

        examCSharp.Questions = new List<Question> { q1, q2, q3, q4 };
        context.Exams.Add(examCSharp);

        // 4. Seed Exam 2: Frontend & React
        var examReact = new Exam
        {
            Id = Guid.Parse("e2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
            Title = "React 19 va TypeScript Zamonaviy Web Development",
            Description = "React Hooks (useState, useEffect, useMemo, useCallback), Custom Hooks, Context API va TypeScript tiplash qoidalari.",
            CategoryId = catIt.Id,
            TeacherId = teacher.Id,
            Difficulty = ExamDifficulty.Easy,
            DurationMinutes = 15,
            PassingScore = 60,
            Visibility = ExamVisibility.Public,
            Status = ExamStatus.Published,
            TotalQuestions = 3,
            TotalPoints = 30,
            MaxAttempts = 3,
            CreatedAt = DateTime.UtcNow.AddDays(-5)
        };

        var rq1 = new Question
        {
            Id = Guid.NewGuid(),
            ExamId = examReact.Id,
            Text = "React da 'useEffect' ichidagi tozalash funksiyasi (cleanup function) qachon ishga tushadi?",
            QuestionType = QuestionType.SingleChoice,
            Points = 10,
            Order = 1,
            Explanation = "Cleanup funksiyasi komponent unmount bo'lishidan oldin yoki keyingi renderda effekt qayta bajarilishidan oldin chaqiriladi."
        };
        var rq1_o1 = new QuestionOption { Id = Guid.NewGuid(), Text = "Komponent sahifadan o'chirilganda (unmount) yoki keyingi effect bajarilishidan oldin.", IsCorrect = true, Order = 1 };
        var rq1_o2 = new QuestionOption { Id = Guid.NewGuid(), Text = "Faqat sahifa yangilanganda (refresh).", IsCorrect = false, Order = 2 };
        var rq1_o3 = new QuestionOption { Id = Guid.NewGuid(), Text = "Har bir useState o'zgarganda doimiy ravishda.", IsCorrect = false, Order = 3 };
        rq1.Options = new List<QuestionOption> { rq1_o1, rq1_o2, rq1_o3 };

        var rq2 = new Question
        {
            Id = Guid.NewGuid(),
            ExamId = examReact.Id,
            Text = "React da 'useCallback' va 'useMemo' hooklari qaysi maqsadda ishlatiladi?",
            QuestionType = QuestionType.SingleChoice,
            Points = 10,
            Order = 2,
            Explanation = "useMemo hisoblangan qiymatlarni, useCallback esa funksiya havolalarini keraksiz qayta renderlardan saqlash uchun keshlaydi."
        };
        var rq2_o1 = new QuestionOption { Id = Guid.NewGuid(), Text = "Og'ir hisob-kitoblar va funksiyalarni keshlab, render unumdorligini oshirish uchun.", IsCorrect = true, Order = 1 };
        var rq2_o2 = new QuestionOption { Id = Guid.NewGuid(), Text = "Ma'lumotlar bazasiga to'g'ridan-to'g'ri ulanish uchun.", IsCorrect = false, Order = 2 };
        var rq2_o3 = new QuestionOption { Id = Guid.NewGuid(), Text = "Faqat CSS uslublarini o'zgartirish uchun.", IsCorrect = false, Order = 3 };
        rq2.Options = new List<QuestionOption> { rq2_o1, rq2_o2, rq2_o3 };

        var rq3 = new Question
        {
            Id = Guid.NewGuid(),
            ExamId = examReact.Id,
            Text = "TypeScript da 'interface' va 'type' orqali ob'ekt shakllarini ifodalash mumkin.",
            QuestionType = QuestionType.TrueFalse,
            Points = 10,
            Order = 3,
            Explanation = "To'g'ri. Har ikkala tuzilma ob'ekt turlarini ta'riflash imkonini beradi."
        };
        var rq3_o1 = new QuestionOption { Id = Guid.NewGuid(), Text = "Rost (To'g'ri)", IsCorrect = true, Order = 1 };
        var rq3_o2 = new QuestionOption { Id = Guid.NewGuid(), Text = "Yolg'on (Noto'g'ri)", IsCorrect = false, Order = 2 };
        rq3.Options = new List<QuestionOption> { rq3_o1, rq3_o2 };

        examReact.Questions = new List<Question> { rq1, rq2, rq3 };
        context.Exams.Add(examReact);

        // 5. Seed Exam 3: English CEFR & IELTS Grammar
        var examEnglish = new Exam
        {
            Id = Guid.Parse("e3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
            Title = "IELTS & CEFR B2/C1 English Mastery",
            Description = "Advanced conditionals, inversion structures, collocations, phrasal verbs and academic writing structures.",
            CategoryId = catEnglish.Id,
            TeacherId = teacher.Id,
            Difficulty = ExamDifficulty.Hard,
            DurationMinutes = 25,
            PassingScore = 70,
            Visibility = ExamVisibility.Public,
            Status = ExamStatus.Published,
            TotalQuestions = 3,
            TotalPoints = 30,
            MaxAttempts = 3,
            CreatedAt = DateTime.UtcNow.AddDays(-3)
        };

        var eq1 = new Question
        {
            Id = Guid.NewGuid(),
            ExamId = examEnglish.Id,
            Text = "Choose the correct inverted sentence: 'Rarely _______ such an extraordinary performance.'",
            QuestionType = QuestionType.SingleChoice,
            Points = 10,
            Order = 1,
            Explanation = "Negative adverbs like 'Rarely' at the start of a sentence trigger inversion (auxiliary + subject + verb)."
        };
        var eq1_o1 = new QuestionOption { Id = Guid.NewGuid(), Text = "have I witnessed", IsCorrect = true, Order = 1 };
        var eq1_o2 = new QuestionOption { Id = Guid.NewGuid(), Text = "I have witnessed", IsCorrect = false, Order = 2 };
        var eq1_o3 = new QuestionOption { Id = Guid.NewGuid(), Text = "I witnessed", IsCorrect = false, Order = 3 };
        var eq1_o4 = new QuestionOption { Id = Guid.NewGuid(), Text = "did I witnessed", IsCorrect = false, Order = 4 };
        eq1.Options = new List<QuestionOption> { eq1_o1, eq1_o2, eq1_o3, eq1_o4 };

        var eq2 = new Question
        {
            Id = Guid.NewGuid(),
            ExamId = examEnglish.Id,
            Text = "'Had you arrived on time, we would not have missed the presentation.' is an example of which conditional?",
            QuestionType = QuestionType.SingleChoice,
            Points = 10,
            Order = 2,
            Explanation = "This is an inverted Third Conditional expressing an unreal past condition."
        };
        var eq2_o1 = new QuestionOption { Id = Guid.NewGuid(), Text = "Third Conditional (Inverted)", IsCorrect = true, Order = 1 };
        var eq2_o2 = new QuestionOption { Id = Guid.NewGuid(), Text = "Second Conditional", IsCorrect = false, Order = 2 };
        var eq2_o3 = new QuestionOption { Id = Guid.NewGuid(), Text = "Zero Conditional", IsCorrect = false, Order = 3 };
        eq2.Options = new List<QuestionOption> { eq2_o1, eq2_o2, eq2_o3 };

        var eq3 = new Question
        {
            Id = Guid.NewGuid(),
            ExamId = examEnglish.Id,
            Text = "The phrase 'take into account' is a formal synonym for 'consider'.",
            QuestionType = QuestionType.TrueFalse,
            Points = 10,
            Order = 3,
            Explanation = "'To take into account' means to consider particular facts or circumstances when making a decision."
        };
        var eq3_o1 = new QuestionOption { Id = Guid.NewGuid(), Text = "True (Rost)", IsCorrect = true, Order = 1 };
        var eq3_o2 = new QuestionOption { Id = Guid.NewGuid(), Text = "False (Yolg'on)", IsCorrect = false, Order = 2 };
        eq3.Options = new List<QuestionOption> { eq3_o1, eq3_o2 };

        examEnglish.Questions = new List<Question> { eq1, eq2, eq3 };
        context.Exams.Add(examEnglish);

        // 6. Seed Sample Completed Attempt for student1
        var attempt1 = new ExamAttempt
        {
            Id = Guid.Parse("f1111111-cccc-cccc-cccc-cccccccccccc"),
            ExamId = examCSharp.Id,
            UserId = student1.Id,
            StartedAt = DateTime.UtcNow.AddDays(-2).AddMinutes(-18),
            ExpiresAt = DateTime.UtcNow.AddDays(-2).AddMinutes(2),
            SubmittedAt = DateTime.UtcNow.AddDays(-2),
            Status = AttemptStatus.Completed,
            TotalPoints = 40,
            EarnedPoints = 40,
            Percentage = 100.0,
            CorrectAnswersCount = 4,
            IncorrectAnswersCount = 0,
            UnansweredCount = 0,
            Passed = true,
            TimeSpentSeconds = 1080
        };

        var a1_ans1 = new Answer
        {
            Id = Guid.NewGuid(),
            ExamAttemptId = attempt1.Id,
            QuestionId = q1.Id,
            SelectedOptionIdsJson = JsonSerializer.Serialize(new List<Guid> { q1_o1.Id }),
            IsCorrect = true,
            EarnedPoints = 10,
            AnsweredAt = DateTime.UtcNow.AddDays(-2).AddMinutes(-15)
        };
        var a1_ans2 = new Answer
        {
            Id = Guid.NewGuid(),
            ExamAttemptId = attempt1.Id,
            QuestionId = q2.Id,
            SelectedOptionIdsJson = JsonSerializer.Serialize(new List<Guid> { q2_o1.Id, q2_o2.Id }),
            IsCorrect = true,
            EarnedPoints = 10,
            AnsweredAt = DateTime.UtcNow.AddDays(-2).AddMinutes(-10)
        };
        var a1_ans3 = new Answer
        {
            Id = Guid.NewGuid(),
            ExamAttemptId = attempt1.Id,
            QuestionId = q3.Id,
            SelectedOptionIdsJson = JsonSerializer.Serialize(new List<Guid> { q3_o1.Id }),
            IsCorrect = true,
            EarnedPoints = 10,
            AnsweredAt = DateTime.UtcNow.AddDays(-2).AddMinutes(-5)
        };
        var a1_ans4 = new Answer
        {
            Id = Guid.NewGuid(),
            ExamAttemptId = attempt1.Id,
            QuestionId = q4.Id,
            SelectedOptionIdsJson = JsonSerializer.Serialize(new List<Guid> { q4_o1.Id }),
            IsCorrect = true,
            EarnedPoints = 10,
            AnsweredAt = DateTime.UtcNow.AddDays(-2).AddMinutes(-2)
        };

        attempt1.Answers = new List<Answer> { a1_ans1, a1_ans2, a1_ans3, a1_ans4 };
        context.ExamAttempts.Add(attempt1);

        // Seed attempt 2 (Aziza on React)
        var attempt2 = new ExamAttempt
        {
            Id = Guid.Parse("f2222222-cccc-cccc-cccc-cccccccccccc"),
            ExamId = examReact.Id,
            UserId = student2.Id,
            StartedAt = DateTime.UtcNow.AddDays(-1).AddMinutes(-10),
            ExpiresAt = DateTime.UtcNow.AddDays(-1).AddMinutes(5),
            SubmittedAt = DateTime.UtcNow.AddDays(-1),
            Status = AttemptStatus.Completed,
            TotalPoints = 30,
            EarnedPoints = 30,
            Percentage = 100.0,
            CorrectAnswersCount = 3,
            IncorrectAnswersCount = 0,
            UnansweredCount = 0,
            Passed = true,
            TimeSpentSeconds = 600
        };

        var a2_ans1 = new Answer
        {
            Id = Guid.NewGuid(),
            ExamAttemptId = attempt2.Id,
            QuestionId = rq1.Id,
            SelectedOptionIdsJson = JsonSerializer.Serialize(new List<Guid> { rq1_o1.Id }),
            IsCorrect = true,
            EarnedPoints = 10,
            AnsweredAt = DateTime.UtcNow.AddDays(-1).AddMinutes(-8)
        };
        var a2_ans2 = new Answer
        {
            Id = Guid.NewGuid(),
            ExamAttemptId = attempt2.Id,
            QuestionId = rq2.Id,
            SelectedOptionIdsJson = JsonSerializer.Serialize(new List<Guid> { rq2_o1.Id }),
            IsCorrect = true,
            EarnedPoints = 10,
            AnsweredAt = DateTime.UtcNow.AddDays(-1).AddMinutes(-5)
        };
        var a2_ans3 = new Answer
        {
            Id = Guid.NewGuid(),
            ExamAttemptId = attempt2.Id,
            QuestionId = rq3.Id,
            SelectedOptionIdsJson = JsonSerializer.Serialize(new List<Guid> { rq3_o1.Id }),
            IsCorrect = true,
            EarnedPoints = 10,
            AnsweredAt = DateTime.UtcNow.AddDays(-1).AddMinutes(-2)
        };

        attempt2.Answers = new List<Answer> { a2_ans1, a2_ans2, a2_ans3 };
        context.ExamAttempts.Add(attempt2);

        // 7. Seed Notifications
        var notif1 = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = student1.Id,
            TitleUz = "Xush kelibsiz!",
            TitleRu = "Добро пожаловать!",
            TitleEn = "Welcome to TestPlatform!",
            MessageUz = "Platformamizga xush kelibsiz. Bilimlaringizni sinash uchun test katalogidan foydalaning.",
            MessageRu = "Добро пожаловать на платформу. Проверьте свои знания в каталоге тестов.",
            MessageEn = "Welcome to the platform. Explore our exam catalog to test your skills.",
            Type = "info",
            IsRead = false
        };

        var notif2 = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = student1.Id,
            TitleUz = "A'lo natija! 🎉",
            TitleRu = "Отличный результат! 🎉",
            TitleEn = "Great Result! 🎉",
            MessageUz = "Siz 'C# va .NET 10 Dasturlash Asoslari' imtihonidan 100% natija bilan muvaffaqiyatli o'tdingiz!",
            MessageRu = "Вы успешно сдали экзамен 'Основы C# и .NET 10' с результатом 100%!",
            MessageEn = "You passed 'C# & .NET 10 Fundamentals' with a 100% score!",
            Type = "success",
            IsRead = true
        };

        context.Notifications.AddRange(notif1, notif2);

        await context.SaveChangesAsync();
    }
}
