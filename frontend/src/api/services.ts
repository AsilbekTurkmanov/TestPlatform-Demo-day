import { apiClient } from './apiClient';
import {
  mockUsers,
  mockCategories,
  mockExams,
  mockQuestions,
} from './mockDb';
import {
  ApiResponse,
  AuthResponse,
  Category,
  Exam,
  ExamDetail,
  PagedResult,
  Question,
  StartExamResponse,
  AttemptDetail,
  SavedAnswer,
  SubmitExamResponse,
  StudentAttempt,
  ResultDetail,
  ParticipantResult,
  StudentAnalytics,
  TeacherAnalytics,
  AdminAnalytics,
  User,
  UserRole,
  ExamDifficulty,
  ExamStatus,
  ExamVisibility,
  QuestionType,
  AttemptStatus,
} from '../types';

// In-memory / localStorage storage for offline demo
const getStoredAttempts = (): Record<string, any> => {
  const saved = localStorage.getItem('demo_attempts');
  return saved ? JSON.parse(saved) : {};
};

const saveStoredAttempts = (data: Record<string, any>) => {
  localStorage.setItem('demo_attempts', JSON.stringify(data));
};

export const authApi = {
  login: async (body: { email: string; password: string }): Promise<ApiResponse<AuthResponse>> => {
    try {
      const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', body);
      return res.data;
    } catch {
      // Mock Fallback
      const found = mockUsers.find((u) => u.email.toLowerCase() === body.email.toLowerCase()) || mockUsers[2];
      return {
        success: true,
        message: 'Mock Login Successful',
        data: {
          id: found.id,
          fullName: found.fullName,
          email: found.email,
          role: found.role,
          avatarUrl: found.avatarUrl,
          accessToken: 'mock_token_' + found.id,
          refreshToken: 'mock_refresh_' + found.id,
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        },
        errors: [],
        timestamp: new Date().toISOString(),
      };
    }
  },
  register: async (body: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: UserRole;
    phoneNumber?: string;
  }): Promise<ApiResponse<AuthResponse>> => {
    try {
      const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', body);
      return res.data;
    } catch {
      const newUser: User = {
        id: 'user_' + Date.now(),
        fullName: body.fullName,
        email: body.email,
        role: body.role,
        isActive: true,
        phoneNumber: body.phoneNumber,
        createdAt: new Date().toISOString(),
      };
      mockUsers.push(newUser);
      return {
        success: true,
        message: 'Mock Registration Successful',
        data: {
          id: newUser.id,
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
          accessToken: 'mock_token_' + newUser.id,
          refreshToken: 'mock_refresh_' + newUser.id,
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        },
        errors: [],
        timestamp: new Date().toISOString(),
      };
    }
  },
  logout: async (refreshToken: string): Promise<ApiResponse<string>> => {
    try {
      const res = await apiClient.post<ApiResponse<string>>('/auth/logout', { refreshToken });
      return res.data;
    } catch {
      return { success: true, message: 'Logged out', data: 'OK', errors: [], timestamp: new Date().toISOString() };
    }
  },
  getMe: async (): Promise<ApiResponse<User>> => {
    try {
      const res = await apiClient.get<ApiResponse<User>>('/auth/me');
      return res.data;
    } catch {
      const userJson = localStorage.getItem('testplatform_user');
      const user: User = userJson ? JSON.parse(userJson) : mockUsers[2];
      return { success: true, message: 'Success', data: user, errors: [], timestamp: new Date().toISOString() };
    }
  },
  updateProfile: async (body: {
    fullName: string;
    phoneNumber?: string;
    bio?: string;
    avatarUrl?: string;
  }): Promise<ApiResponse<User>> => {
    try {
      const res = await apiClient.put<ApiResponse<User>>('/auth/profile', body);
      return res.data;
    } catch {
      const userJson = localStorage.getItem('testplatform_user');
      const user: User = userJson ? JSON.parse(userJson) : mockUsers[2];
      const updated = { ...user, ...body };
      return { success: true, message: 'Updated', data: updated, errors: [], timestamp: new Date().toISOString() };
    }
  },
  changePassword: async (body: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }): Promise<ApiResponse<string>> => {
    try {
      const res = await apiClient.post<ApiResponse<string>>('/auth/change-password', body);
      return res.data;
    } catch {
      return { success: true, message: 'Password changed successfully', data: 'OK', errors: [], timestamp: new Date().toISOString() };
    }
  },
};

export const examApi = {
  getExams: async (params?: {
    search?: string;
    categoryId?: string;
    difficulty?: ExamDifficulty;
    status?: ExamStatus;
    visibility?: ExamVisibility;
    teacherId?: string;
    sortBy?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PagedResult<Exam>>> => {
    try {
      const res = await apiClient.get<ApiResponse<PagedResult<Exam>>>('/exams', { params });
      return res.data;
    } catch {
      let list = [...mockExams];
      if (params?.search) {
        list = list.filter((e) => e.title.toLowerCase().includes(params.search!.toLowerCase()));
      }
      if (params?.categoryId) {
        list = list.filter((e) => e.categoryId === params.categoryId);
      }
      if (params?.difficulty) {
        list = list.filter((e) => e.difficulty === params.difficulty);
      }
      return {
        success: true,
        message: 'Success',
        data: {
          items: list,
          totalCount: list.length,
          pageNumber: 1,
          pageSize: 50,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
        errors: [],
        timestamp: new Date().toISOString(),
      };
    }
  },
  getExamById: async (id: string): Promise<ApiResponse<ExamDetail>> => {
    try {
      const res = await apiClient.get<ApiResponse<ExamDetail>>(`/exams/${id}`);
      return res.data;
    } catch {
      const found = mockExams.find((e) => e.id === id) || mockExams[0];
      const questions = mockQuestions[found.id] || mockQuestions['e1111111-1111-1111-1111-111111111111'];
      return {
        success: true,
        message: 'Success',
        data: {
          ...found,
          questions,
          hasUserAttempted: false,
          userAttemptsCount: 0,
        },
        errors: [],
        timestamp: new Date().toISOString(),
      };
    }
  },
  createExam: async (body: any): Promise<ApiResponse<Exam>> => {
    try {
      const res = await apiClient.post<ApiResponse<Exam>>('/exams', body);
      return res.data;
    } catch {
      const newExam: Exam = {
        id: 'e_' + Date.now(),
        ...body,
        categoryName: mockCategories.find((c) => c.id === body.categoryId)?.nameUz || 'IT & Dasturlash',
        categoryColor: '#3B82F6',
        categoryIcon: 'Code2',
        teacherId: '22222222-2222-2222-2222-222222222222',
        teacherName: 'Anvar Karimov',
        totalQuestions: 0,
        totalPoints: 0,
        participantCount: 0,
        averageScore: 0,
        createdAt: new Date().toISOString(),
      };
      mockExams.unshift(newExam);
      return { success: true, message: 'Created', data: newExam, errors: [], timestamp: new Date().toISOString() };
    }
  },
  updateExam: async (id: string, body: any): Promise<ApiResponse<Exam>> => {
    try {
      const res = await apiClient.put<ApiResponse<Exam>>(`/exams/${id}`, body);
      return res.data;
    } catch {
      const idx = mockExams.findIndex((e) => e.id === id);
      if (idx >= 0) {
        mockExams[idx] = { ...mockExams[idx], ...body };
        return { success: true, message: 'Updated', data: mockExams[idx], errors: [], timestamp: new Date().toISOString() };
      }
      return { success: true, message: 'Updated', data: mockExams[0], errors: [], timestamp: new Date().toISOString() };
    }
  },
  deleteExam: async (id: string): Promise<ApiResponse<string>> => {
    try {
      const res = await apiClient.delete<ApiResponse<string>>(`/exams/${id}`);
      return res.data;
    } catch {
      const idx = mockExams.findIndex((e) => e.id === id);
      if (idx >= 0) mockExams.splice(idx, 1);
      return { success: true, message: 'Deleted', data: 'OK', errors: [], timestamp: new Date().toISOString() };
    }
  },
  publishExam: async (id: string): Promise<ApiResponse<Exam>> => {
    try {
      const res = await apiClient.post<ApiResponse<Exam>>(`/exams/${id}/publish`);
      return res.data;
    } catch {
      const found = mockExams.find((e) => e.id === id);
      if (found) found.status = ExamStatus.Published;
      return { success: true, message: 'Published', data: found || mockExams[0], errors: [], timestamp: new Date().toISOString() };
    }
  },
  unpublishExam: async (id: string): Promise<ApiResponse<Exam>> => {
    try {
      const res = await apiClient.post<ApiResponse<Exam>>(`/exams/${id}/unpublish`);
      return res.data;
    } catch {
      const found = mockExams.find((e) => e.id === id);
      if (found) found.status = ExamStatus.Draft;
      return { success: true, message: 'Unpublished', data: found || mockExams[0], errors: [], timestamp: new Date().toISOString() };
    }
  },
  duplicateExam: async (id: string): Promise<ApiResponse<Exam>> => {
    try {
      const res = await apiClient.post<ApiResponse<Exam>>(`/exams/${id}/duplicate`);
      return res.data;
    } catch {
      const original = mockExams.find((e) => e.id === id) || mockExams[0];
      const copy: Exam = {
        ...original,
        id: 'e_' + Date.now(),
        title: original.title + ' (Nusxa)',
        status: ExamStatus.Draft,
        participantCount: 0,
        createdAt: new Date().toISOString(),
      };
      mockExams.unshift(copy);
      return { success: true, message: 'Duplicated', data: copy, errors: [], timestamp: new Date().toISOString() };
    }
  },
  getTeacherExams: async (): Promise<ApiResponse<Exam[]>> => {
    try {
      const res = await apiClient.get<ApiResponse<Exam[]>>('/exams/teacher/my');
      return res.data;
    } catch {
      return { success: true, message: 'Success', data: mockExams, errors: [], timestamp: new Date().toISOString() };
    }
  },
};

export const questionApi = {
  getExamQuestions: async (examId: string): Promise<ApiResponse<Question[]>> => {
    try {
      const res = await apiClient.get<ApiResponse<Question[]>>(`/questions/exam/${examId}`);
      return res.data;
    } catch {
      const questions = mockQuestions[examId] || mockQuestions['e1111111-1111-1111-1111-111111111111'];
      return { success: true, message: 'Success', data: questions, errors: [], timestamp: new Date().toISOString() };
    }
  },
  getQuestionById: async (id: string): Promise<ApiResponse<Question>> => {
    try {
      const res = await apiClient.get<ApiResponse<Question>>(`/questions/${id}`);
      return res.data;
    } catch {
      const allQ = Object.values(mockQuestions).flat();
      const found = allQ.find((q) => q.id === id) || allQ[0];
      return { success: true, message: 'Success', data: found, errors: [], timestamp: new Date().toISOString() };
    }
  },
  createQuestion: async (examId: string, body: any): Promise<ApiResponse<Question>> => {
    try {
      const res = await apiClient.post<ApiResponse<Question>>(`/questions/exam/${examId}`, body);
      return res.data;
    } catch {
      if (!mockQuestions[examId]) mockQuestions[examId] = [];
      const newQ: Question = {
        id: 'q_' + Date.now(),
        examId,
        ...body,
        order: mockQuestions[examId].length + 1,
        options: body.options.map((o: any, idx: number) => ({
          id: 'opt_' + Date.now() + '_' + idx,
          questionId: 'q_' + Date.now(),
          text: o.text,
          isCorrect: o.isCorrect,
          order: idx + 1,
        })),
      };
      mockQuestions[examId].push(newQ);
      return { success: true, message: 'Created', data: newQ, errors: [], timestamp: new Date().toISOString() };
    }
  },
  updateQuestion: async (id: string, body: any): Promise<ApiResponse<Question>> => {
    try {
      const res = await apiClient.put<ApiResponse<Question>>(`/questions/${id}`, body);
      return res.data;
    } catch {
      return { success: true, message: 'Updated', data: body, errors: [], timestamp: new Date().toISOString() };
    }
  },
  deleteQuestion: async (id: string): Promise<ApiResponse<string>> => {
    try {
      const res = await apiClient.delete<ApiResponse<string>>(`/questions/${id}`);
      return res.data;
    } catch {
      return { success: true, message: 'Deleted', data: 'OK', errors: [], timestamp: new Date().toISOString() };
    }
  },
  reorderQuestions: async (examId: string, items: any): Promise<ApiResponse<string>> => {
    try {
      const res = await apiClient.put<ApiResponse<string>>(`/questions/exam/${examId}/reorder`, { items });
      return res.data;
    } catch {
      return { success: true, message: 'Reordered', data: 'OK', errors: [], timestamp: new Date().toISOString() };
    }
  },
};

export const attemptApi = {
  startExam: async (examId: string): Promise<ApiResponse<StartExamResponse>> => {
    try {
      const res = await apiClient.post<ApiResponse<StartExamResponse>>(`/attempts/exams/${examId}/start`);
      return res.data;
    } catch {
      const exam = mockExams.find((e) => e.id === examId) || mockExams[0];
      const questions = mockQuestions[exam.id] || mockQuestions['e1111111-1111-1111-1111-111111111111'];
      const attemptId = 'att_' + Date.now();
      const expiresAt = new Date(Date.now() + exam.durationMinutes * 60 * 1000).toISOString();

      const takingQuestions = questions.map((q) => ({
        id: q.id,
        text: q.text,
        questionType: q.questionType,
        points: q.points,
        order: q.order,
        codeSnippet: q.codeSnippet,
        options: q.options.map((o) => ({ id: o.id, text: o.text, order: o.order })),
      }));

      const attemptObj = {
        attemptId,
        examId: exam.id,
        examTitle: exam.title,
        categoryName: exam.categoryName,
        durationMinutes: exam.durationMinutes,
        totalQuestions: questions.length,
        totalPoints: questions.reduce((acc, q) => acc + q.points, 0),
        passingScore: exam.passingScore,
        startedAt: new Date().toISOString(),
        expiresAt,
        status: AttemptStatus.InProgress,
        remainingSeconds: exam.durationMinutes * 60,
        questions: takingQuestions,
        savedAnswers: [],
      };

      const stored = getStoredAttempts();
      stored[attemptId] = attemptObj;
      saveStoredAttempts(stored);

      return { success: true, message: 'Started', data: attemptObj, errors: [], timestamp: new Date().toISOString() };
    }
  },
  getAttempt: async (id: string): Promise<ApiResponse<AttemptDetail>> => {
    try {
      const res = await apiClient.get<ApiResponse<AttemptDetail>>(`/attempts/${id}`);
      return res.data;
    } catch {
      const stored = getStoredAttempts();
      const found = stored[id];
      if (found) {
        return { success: true, message: 'Success', data: found, errors: [], timestamp: new Date().toISOString() };
      }
      // Return default
      const defaultExam = mockExams[0];
      const questions = mockQuestions[defaultExam.id];
      const fallbackObj: AttemptDetail = {
        attemptId: id,
        examId: defaultExam.id,
        examTitle: defaultExam.title,
        categoryName: defaultExam.categoryName,
        durationMinutes: defaultExam.durationMinutes,
        totalQuestions: questions.length,
        totalPoints: 40,
        passingScore: defaultExam.passingScore,
        startedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1800000).toISOString(),
        status: AttemptStatus.InProgress,
        remainingSeconds: 1800,
        questions: questions.map((q) => ({
          id: q.id,
          text: q.text,
          questionType: q.questionType,
          points: q.points,
          order: q.order,
          codeSnippet: q.codeSnippet,
          options: q.options.map((o) => ({ id: o.id, text: o.text, order: o.order })),
        })),
        savedAnswers: [],
      };
      return { success: true, message: 'Success', data: fallbackObj, errors: [], timestamp: new Date().toISOString() };
    }
  },
  saveAnswer: async (id: string, body: any): Promise<ApiResponse<SavedAnswer>> => {
    try {
      const res = await apiClient.post<ApiResponse<SavedAnswer>>(`/attempts/${id}/answers`, body);
      return res.data;
    } catch {
      const stored = getStoredAttempts();
      if (stored[id]) {
        stored[id].savedAnswers = stored[id].savedAnswers.filter((a: any) => a.questionId !== body.questionId);
        stored[id].savedAnswers.push({
          questionId: body.questionId,
          selectedOptionIds: body.selectedOptionIds,
          isMarkedForReview: !!body.isMarkedForReview,
          answeredAt: new Date().toISOString(),
        });
        saveStoredAttempts(stored);
      }
      return {
        success: true,
        message: 'Saved',
        data: {
          questionId: body.questionId,
          selectedOptionIds: body.selectedOptionIds,
          isMarkedForReview: !!body.isMarkedForReview,
          answeredAt: new Date().toISOString(),
        },
        errors: [],
        timestamp: new Date().toISOString(),
      };
    }
  },
  submitExam: async (id: string): Promise<ApiResponse<SubmitExamResponse>> => {
    try {
      const res = await apiClient.post<ApiResponse<SubmitExamResponse>>(`/attempts/${id}/submit`);
      return res.data;
    } catch {
      const stored = getStoredAttempts();
      const att = stored[id];
      if (att) {
        att.status = AttemptStatus.Completed;
        saveStoredAttempts(stored);
      }
      return {
        success: true,
        message: 'Exam submitted',
        data: {
          attemptId: id,
          examId: att?.examId || mockExams[0].id,
          examTitle: att?.examTitle || mockExams[0].title,
          totalPoints: 40,
          earnedPoints: 30,
          percentage: 75,
          correctAnswersCount: 3,
          incorrectAnswersCount: 1,
          unansweredCount: 0,
          passed: true,
          passingScore: 70,
          timeSpentSeconds: 420,
          submittedAt: new Date().toISOString(),
        },
        errors: [],
        timestamp: new Date().toISOString(),
      };
    }
  },
  getMyAttempts: async (): Promise<ApiResponse<StudentAttempt[]>> => {
    try {
      const res = await apiClient.get<ApiResponse<StudentAttempt[]>>('/attempts/my');
      return res.data;
    } catch {
      const attempts: StudentAttempt[] = [
        {
          id: 'att_demo_1',
          examId: mockExams[0].id,
          examTitle: mockExams[0].title,
          categoryName: 'IT & Dasturlash',
          categoryColor: '#3B82F6',
          difficulty: ExamDifficulty.Medium,
          startedAt: '2026-02-25T10:00:00Z',
          submittedAt: '2026-02-25T10:20:00Z',
          status: AttemptStatus.Completed,
          totalPoints: 40,
          earnedPoints: 30,
          percentage: 75,
          passed: true,
          timeSpentSeconds: 1200,
        },
        {
          id: 'att_demo_2',
          examId: mockExams[1].id,
          examTitle: mockExams[1].title,
          categoryName: 'IT & Dasturlash',
          categoryColor: '#3B82F6',
          difficulty: ExamDifficulty.Hard,
          startedAt: '2026-02-20T14:00:00Z',
          submittedAt: '2026-02-20T14:35:00Z',
          status: AttemptStatus.Completed,
          totalPoints: 30,
          earnedPoints: 20,
          percentage: 66.7,
          passed: false,
          timeSpentSeconds: 2100,
        },
      ];
      return { success: true, message: 'Success', data: attempts, errors: [], timestamp: new Date().toISOString() };
    }
  },
};

export const resultApi = {
  getResultById: async (id: string): Promise<ApiResponse<ResultDetail>> => {
    try {
      const res = await apiClient.get<ApiResponse<ResultDetail>>(`/results/${id}`);
      return res.data;
    } catch {
      const questions = mockQuestions['e1111111-1111-1111-1111-111111111111'];
      const reviews = questions.map((q, idx) => ({
        questionId: q.id,
        text: q.text,
        questionType: q.questionType,
        points: q.points,
        earnedPoints: idx < 3 ? q.points : 0,
        order: q.order,
        explanation: q.explanation,
        codeSnippet: q.codeSnippet,
        isCorrect: idx < 3,
        wasAnswered: true,
        selectedOptionIds: [q.options[0].id],
        options: q.options.map((o) => ({
          id: o.id,
          text: o.text,
          isCorrect: o.isCorrect,
          isSelected: o.id === q.options[0].id,
          order: o.order,
        })),
      }));

      const resDetail: ResultDetail = {
        attemptId: id,
        examId: mockExams[0].id,
        examTitle: mockExams[0].title,
        categoryName: mockExams[0].categoryName,
        categoryColor: '#3B82F6',
        difficulty: ExamDifficulty.Medium,
        passingScore: 70,
        startedAt: '2026-02-25T10:00:00Z',
        submittedAt: '2026-02-25T10:20:00Z',
        status: AttemptStatus.Completed,
        totalPoints: 40,
        earnedPoints: 30,
        percentage: 75,
        correctAnswersCount: 3,
        incorrectAnswersCount: 1,
        unansweredCount: 0,
        passed: true,
        timeSpentSeconds: 1200,
        allocatedSeconds: 1800,
        questionReviews: reviews,
      };
      return { success: true, message: 'Success', data: resDetail, errors: [], timestamp: new Date().toISOString() };
    }
  },
  getMyResults: async (): Promise<ApiResponse<StudentAttempt[]>> => {
    return attemptApi.getMyAttempts();
  },
  getExamParticipants: async (examId: string): Promise<ApiResponse<ParticipantResult[]>> => {
    try {
      const res = await apiClient.get<ApiResponse<ParticipantResult[]>>(`/results/exams/${examId}/participants`);
      return res.data;
    } catch {
      const participants: ParticipantResult[] = [
        {
          attemptId: 'att_p1',
          userId: mockUsers[2].id,
          studentName: mockUsers[2].fullName,
          studentEmail: mockUsers[2].email,
          studentAvatarUrl: mockUsers[2].avatarUrl,
          startedAt: '2026-02-25T10:00:00Z',
          submittedAt: '2026-02-25T10:20:00Z',
          status: AttemptStatus.Completed,
          earnedPoints: 30,
          totalPoints: 40,
          percentage: 75,
          passed: true,
          timeSpentSeconds: 1200,
        },
        {
          attemptId: 'att_p2',
          userId: mockUsers[3].id,
          studentName: mockUsers[3].fullName,
          studentEmail: mockUsers[3].email,
          studentAvatarUrl: mockUsers[3].avatarUrl,
          startedAt: '2026-02-26T14:00:00Z',
          submittedAt: '2026-02-26T14:28:00Z',
          status: AttemptStatus.Completed,
          earnedPoints: 40,
          totalPoints: 40,
          percentage: 100,
          passed: true,
          timeSpentSeconds: 1680,
        },
      ];
      return { success: true, message: 'Success', data: participants, errors: [], timestamp: new Date().toISOString() };
    }
  },
};

export const analyticsApi = {
  getStudentAnalytics: async (): Promise<ApiResponse<StudentAnalytics>> => {
    try {
      const res = await apiClient.get<ApiResponse<StudentAnalytics>>('/analytics/student');
      return res.data;
    } catch {
      const data: StudentAnalytics = {
        totalExamsTaken: 5,
        completedExams: 4,
        passedExams: 3,
        passRate: 75,
        averageScore: 78.5,
        totalTimeSpentMinutes: 145,
        strongestCategory: 'IT & Dasturlash',
        weakestCategory: 'Ingliz tili (IELTS / CEFR)',
        scoreHistory: [
          { date: '01 Fev', examTitle: 'C# Asoslari', score: 65, passingScore: 60 },
          { date: '08 Fev', examTitle: 'React & TS', score: 70, passingScore: 70 },
          { date: '15 Fev', examTitle: 'IELTS Grammar', score: 85, passingScore: 65 },
          { date: '22 Fev', examTitle: 'C# & .NET 10', score: 75, passingScore: 70 },
          { date: '28 Fev', examTitle: 'React Advanced', score: 90, passingScore: 75 },
        ],
        categoryPerformance: [
          { categoryName: 'IT & Dasturlash', categoryColor: '#3B82F6', examsTaken: 3, averageScore: 82, passRate: 100 },
          { categoryName: 'Ingliz tili', categoryColor: '#8B5CF6', examsTaken: 1, averageScore: 70, passRate: 100 },
          { categoryName: 'Matematika', categoryColor: '#10B981', examsTaken: 1, averageScore: 60, passRate: 0 },
        ],
        difficultyPerformance: [
          { difficulty: ExamDifficulty.Easy, totalAttempts: 1, averageScore: 90, passRate: 100 },
          { difficulty: ExamDifficulty.Medium, totalAttempts: 3, averageScore: 78, passRate: 100 },
          { difficulty: ExamDifficulty.Hard, totalAttempts: 1, averageScore: 65, passRate: 0 },
        ],
      };
      return { success: true, message: 'Success', data, errors: [], timestamp: new Date().toISOString() };
    }
  },
  getTeacherAnalytics: async (): Promise<ApiResponse<TeacherAnalytics>> => {
    try {
      const res = await apiClient.get<ApiResponse<TeacherAnalytics>>('/analytics/teacher');
      return res.data;
    } catch {
      const data: TeacherAnalytics = {
        totalExamsCreated: 3,
        publishedExams: 3,
        totalStudentAttempts: 12,
        overallPassRate: 83.3,
        overallAverageScore: 79.2,
        examSummaries: [
          { examId: mockExams[0].id, examTitle: mockExams[0].title, attemptsCount: 6, averageScore: 78, passRate: 83.3, durationMinutes: 30 },
          { examId: mockExams[1].id, examTitle: mockExams[1].title, attemptsCount: 4, averageScore: 82, passRate: 75, durationMinutes: 45 },
          { examId: mockExams[2].id, examTitle: mockExams[2].title, attemptsCount: 2, averageScore: 85, passRate: 100, durationMinutes: 40 },
        ],
        mostMissedQuestions: [
          { questionId: 'q4', examTitle: 'C# & .NET 10', questionText: 'Quyidagi kod natijasida konsolga nima chiqadi?', totalAnswers: 6, incorrectAnswers: 3, missRate: 50 },
          { questionId: 'q2', examTitle: 'C# & .NET 10', questionText: 'Xotirani boshqarish va resurslarni ozod qilish', totalAnswers: 6, incorrectAnswers: 2, missRate: 33.3 },
        ],
        scoreDistribution: [
          { range: '0-50%', count: 1, percentage: 8.3 },
          { range: '50-70%', count: 2, percentage: 16.7 },
          { range: '70-85%', count: 5, percentage: 41.7 },
          { range: '85-100%', count: 4, percentage: 33.3 },
        ],
      };
      return { success: true, message: 'Success', data, errors: [], timestamp: new Date().toISOString() };
    }
  },
  getAdminAnalytics: async (): Promise<ApiResponse<AdminAnalytics>> => {
    try {
      const res = await apiClient.get<ApiResponse<AdminAnalytics>>('/analytics/admin');
      return res.data;
    } catch {
      const data: AdminAnalytics = {
        totalUsers: 18,
        totalStudents: 14,
        totalTeachers: 3,
        totalExams: 3,
        totalAttempts: 14,
        completedAttempts: 12,
        platformAverageScore: 78.4,
        platformPassRate: 83.3,
        userGrowth: [
          { month: 'Noy', students: 3, teachers: 1, total: 4 },
          { month: 'Dek', students: 6, teachers: 2, total: 8 },
          { month: 'Yan', students: 10, teachers: 2, total: 12 },
          { month: 'Fev', students: 14, teachers: 3, total: 18 },
        ],
        examActivity: [
          { date: 'Dush', attempts: 2, completed: 2 },
          { date: 'Sesh', attempts: 3, completed: 2 },
          { date: 'Chor', attempts: 4, completed: 4 },
          { date: 'Pay', attempts: 2, completed: 2 },
          { date: 'Juma', attempts: 3, completed: 2 },
        ],
        categoryDistribution: [
          { categoryName: 'IT & Dasturlash', color: '#3B82F6', examCount: 2, attemptCount: 10 },
          { categoryName: 'Ingliz tili', color: '#8B5CF6', examCount: 1, attemptCount: 4 },
        ],
      };
      return { success: true, message: 'Success', data, errors: [], timestamp: new Date().toISOString() };
    }
  },
};

export const userApi = {
  getUsers: async (params?: {
    search?: string;
    role?: UserRole;
    isActive?: boolean;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PagedResult<User>>> => {
    try {
      const res = await apiClient.get<ApiResponse<PagedResult<User>>>('/users', { params });
      return res.data;
    } catch {
      let list = [...mockUsers];
      if (params?.search) {
        list = list.filter((u) => u.fullName.toLowerCase().includes(params.search!.toLowerCase()) || u.email.toLowerCase().includes(params.search!.toLowerCase()));
      }
      if (params?.role) {
        list = list.filter((u) => u.role === params.role);
      }
      return {
        success: true,
        message: 'Success',
        data: {
          items: list,
          totalCount: list.length,
          pageNumber: 1,
          pageSize: 50,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
        errors: [],
        timestamp: new Date().toISOString(),
      };
    }
  },
  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    try {
      const res = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
      return res.data;
    } catch {
      const found = mockUsers.find((u) => u.id === id) || mockUsers[0];
      return { success: true, message: 'Success', data: found, errors: [], timestamp: new Date().toISOString() };
    }
  },
  createUser: async (body: any): Promise<ApiResponse<User>> => {
    try {
      const res = await apiClient.post<ApiResponse<User>>('/users', body);
      return res.data;
    } catch {
      const newUser: User = {
        id: 'u_' + Date.now(),
        fullName: body.fullName,
        email: body.email,
        role: body.role,
        isActive: body.isActive ?? true,
        phoneNumber: body.phoneNumber,
        createdAt: new Date().toISOString(),
      };
      mockUsers.unshift(newUser);
      return { success: true, message: 'Created', data: newUser, errors: [], timestamp: new Date().toISOString() };
    }
  },
  updateUser: async (id: string, body: any): Promise<ApiResponse<User>> => {
    try {
      const res = await apiClient.put<ApiResponse<User>>(`/users/${id}`, body);
      return res.data;
    } catch {
      const idx = mockUsers.findIndex((u) => u.id === id);
      if (idx >= 0) {
        mockUsers[idx] = { ...mockUsers[idx], ...body };
        return { success: true, message: 'Updated', data: mockUsers[idx], errors: [], timestamp: new Date().toISOString() };
      }
      return { success: true, message: 'Updated', data: mockUsers[0], errors: [], timestamp: new Date().toISOString() };
    }
  },
  deleteUser: async (id: string): Promise<ApiResponse<string>> => {
    try {
      const res = await apiClient.delete<ApiResponse<string>>(`/users/${id}`);
      return res.data;
    } catch {
      const idx = mockUsers.findIndex((u) => u.id === id);
      if (idx >= 0) mockUsers.splice(idx, 1);
      return { success: true, message: 'Deleted', data: 'OK', errors: [], timestamp: new Date().toISOString() };
    }
  },
  activateUser: async (id: string): Promise<ApiResponse<string>> => {
    try {
      const res = await apiClient.post<ApiResponse<string>>(`/users/${id}/activate`);
      return res.data;
    } catch {
      const found = mockUsers.find((u) => u.id === id);
      if (found) found.isActive = true;
      return { success: true, message: 'Activated', data: 'OK', errors: [], timestamp: new Date().toISOString() };
    }
  },
  deactivateUser: async (id: string): Promise<ApiResponse<string>> => {
    try {
      const res = await apiClient.post<ApiResponse<string>>(`/users/${id}/deactivate`);
      return res.data;
    } catch {
      const found = mockUsers.find((u) => u.id === id);
      if (found) found.isActive = false;
      return { success: true, message: 'Deactivated', data: 'OK', errors: [], timestamp: new Date().toISOString() };
    }
  },
};

export const categoryApi = {
  getCategories: async (activeOnly: boolean = false): Promise<ApiResponse<Category[]>> => {
    try {
      const res = await apiClient.get<ApiResponse<Category[]>>('/categories', {
        params: { activeOnly },
      });
      return res.data;
    } catch {
      return { success: true, message: 'Success', data: mockCategories, errors: [], timestamp: new Date().toISOString() };
    }
  },
  getCategoryById: async (id: string): Promise<ApiResponse<Category>> => {
    try {
      const res = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
      return res.data;
    } catch {
      const found = mockCategories.find((c) => c.id === id) || mockCategories[0];
      return { success: true, message: 'Success', data: found, errors: [], timestamp: new Date().toISOString() };
    }
  },
  createCategory: async (body: any): Promise<ApiResponse<Category>> => {
    try {
      const res = await apiClient.post<ApiResponse<Category>>('/categories', body);
      return res.data;
    } catch {
      const newCat: Category = {
        id: 'cat_' + Date.now(),
        nameUz: body.nameUz,
        nameRu: body.nameRu,
        nameEn: body.nameEn,
        slug: 'slug-' + Date.now(),
        descriptionUz: body.descriptionUz,
        icon: body.icon || 'Code2',
        color: body.color || '#3B82F6',
        displayOrder: mockCategories.length + 1,
        isActive: true,
        examCount: 0,
      };
      mockCategories.push(newCat);
      return { success: true, message: 'Created', data: newCat, errors: [], timestamp: new Date().toISOString() };
    }
  },
  updateCategory: async (id: string, body: any): Promise<ApiResponse<Category>> => {
    try {
      const res = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, body);
      return res.data;
    } catch {
      const idx = mockCategories.findIndex((c) => c.id === id);
      if (idx >= 0) {
        mockCategories[idx] = { ...mockCategories[idx], ...body };
        return { success: true, message: 'Updated', data: mockCategories[idx], errors: [], timestamp: new Date().toISOString() };
      }
      return { success: true, message: 'Updated', data: mockCategories[0], errors: [], timestamp: new Date().toISOString() };
    }
  },
  deleteCategory: async (id: string): Promise<ApiResponse<string>> => {
    try {
      const res = await apiClient.delete<ApiResponse<string>>(`/categories/${id}`);
      return res.data;
    } catch {
      const idx = mockCategories.findIndex((c) => c.id === id);
      if (idx >= 0) mockCategories.splice(idx, 1);
      return { success: true, message: 'Deleted', data: 'OK', errors: [], timestamp: new Date().toISOString() };
    }
  },
};
