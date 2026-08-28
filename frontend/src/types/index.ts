export enum UserRole {
  Student = 1,
  Teacher = 2,
  Admin = 3
}

export enum ExamDifficulty {
  Easy = 1,
  Medium = 2,
  Hard = 3
}

export enum ExamVisibility {
  Public = 1,
  Private = 2
}

export enum ExamStatus {
  Draft = 1,
  Published = 2,
  Archived = 3
}

export enum QuestionType {
  SingleChoice = 1,
  MultipleChoice = 2,
  TrueFalse = 3
}

export enum AttemptStatus {
  InProgress = 1,
  Completed = 2,
  Expired = 3,
  Abandoned = 4
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
  timestamp: string;
  traceId?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  avatarUrl?: string;
  phoneNumber?: string;
  bio?: string;
  createdAt: string;
  examsCount?: number;
  attemptsCount?: number;
}

export interface AuthResponse {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface Category {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  slug: string;
  descriptionUz?: string;
  descriptionRu?: string;
  descriptionEn?: string;
  icon: string;
  color: string;
  displayOrder: number;
  isActive: boolean;
  examCount: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  teacherId: string;
  teacherName: string;
  difficulty: ExamDifficulty;
  durationMinutes: number;
  passingScore: number;
  visibility: ExamVisibility;
  status: ExamStatus;
  totalQuestions: number;
  totalPoints: number;
  maxAttempts: number;
  participantCount: number;
  averageScore: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ExamDetail extends Exam {
  category?: Category;
  questions: Question[];
  hasUserAttempted: boolean;
  userAttemptsCount: number;
  bestScore?: number;
}

export interface Question {
  id: string;
  examId: string;
  text: string;
  questionType: QuestionType;
  points: number;
  order: number;
  explanation?: string;
  codeSnippet?: string;
  options: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface ExamTakingQuestion {
  id: string;
  text: string;
  questionType: QuestionType;
  points: number;
  order: number;
  codeSnippet?: string;
  options: ExamTakingOption[];
}

export interface ExamTakingOption {
  id: string;
  text: string;
  order: number;
}

export interface SavedAnswer {
  questionId: string;
  selectedOptionIds: string[];
  isMarkedForReview: boolean;
  answeredAt: string;
}

export interface StartExamResponse {
  attemptId: string;
  examId: string;
  examTitle: string;
  categoryName: string;
  durationMinutes: number;
  totalQuestions: number;
  totalPoints: number;
  passingScore: number;
  startedAt: string;
  expiresAt: string;
  remainingSeconds: number;
  questions: ExamTakingQuestion[];
  savedAnswers: SavedAnswer[];
}

export interface AttemptDetail {
  attemptId: string;
  examId: string;
  examTitle: string;
  categoryName: string;
  durationMinutes: number;
  totalQuestions: number;
  totalPoints: number;
  passingScore: number;
  startedAt: string;
  expiresAt: string;
  remainingSeconds: number;
  status: AttemptStatus;
  questions: ExamTakingQuestion[];
  savedAnswers: SavedAnswer[];
}

export interface SubmitExamResponse {
  attemptId: string;
  examId: string;
  examTitle: string;
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
  correctAnswersCount: number;
  incorrectAnswersCount: number;
  unansweredCount: number;
  passed: boolean;
  passingScore: number;
  timeSpentSeconds: number;
  submittedAt: string;
}

export interface StudentAttempt {
  id: string;
  examId: string;
  examTitle: string;
  categoryName: string;
  categoryColor: string;
  difficulty: ExamDifficulty;
  startedAt: string;
  submittedAt?: string;
  status: AttemptStatus;
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
}

export interface OptionReview {
  id: string;
  text: string;
  isCorrect: boolean;
  isSelected: boolean;
  order: number;
}

export interface QuestionReview {
  questionId: string;
  text: string;
  questionType: QuestionType;
  points: number;
  earnedPoints: number;
  order: number;
  explanation?: string;
  codeSnippet?: string;
  isCorrect?: boolean;
  wasAnswered: boolean;
  selectedOptionIds: string[];
  options: OptionReview[];
}

export interface ResultDetail {
  attemptId: string;
  examId: string;
  examTitle: string;
  categoryName: string;
  categoryColor: string;
  difficulty: ExamDifficulty;
  passingScore: number;
  startedAt: string;
  submittedAt?: string;
  status: AttemptStatus;
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
  correctAnswersCount: number;
  incorrectAnswersCount: number;
  unansweredCount: number;
  passed: boolean;
  timeSpentSeconds: number;
  allocatedSeconds: number;
  questionReviews: QuestionReview[];
}

export interface ParticipantResult {
  attemptId: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  studentAvatarUrl?: string;
  startedAt: string;
  submittedAt?: string;
  status: AttemptStatus;
  earnedPoints: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
}

export interface StudentAnalytics {
  totalExamsTaken: number;
  completedExams: number;
  passedExams: number;
  passRate: number;
  averageScore: number;
  totalTimeSpentMinutes: number;
  strongestCategory: string;
  weakestCategory: string;
  scoreHistory: { date: string; examTitle: string; score: number; passingScore: number }[];
  categoryPerformance: { categoryName: string; categoryColor: string; examsTaken: number; averageScore: number; passRate: number }[];
  difficultyPerformance: { difficulty: ExamDifficulty; totalAttempts: number; averageScore: number; passRate: number }[];
}

export interface TeacherAnalytics {
  totalExamsCreated: number;
  publishedExams: number;
  totalStudentAttempts: number;
  overallPassRate: number;
  overallAverageScore: number;
  examSummaries: { examId: string; examTitle: string; attemptsCount: number; averageScore: number; passRate: number; durationMinutes: number }[];
  mostMissedQuestions: { questionId: string; examTitle: string; questionText: string; totalAnswers: number; incorrectAnswers: number; missRate: number }[];
  scoreDistribution: { range: string; count: number; percentage: number }[];
}

export interface AdminAnalytics {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalExams: number;
  totalAttempts: number;
  completedAttempts: number;
  platformAverageScore: number;
  platformPassRate: number;
  userGrowth: { month: string; students: number; teachers: number; total: number }[];
  examActivity: { date: string; attempts: number; completed: number }[];
  categoryDistribution: { categoryName: string; color: string; examCount: number; attemptCount: number }[];
}
