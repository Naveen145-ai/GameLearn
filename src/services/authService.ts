import axios from 'axios';

const API_BASE_URL = 'http://10.68.167.242:3004/api';

export interface StudentSignupData {
  email: string;
  password: string;
  name: string;
  grade: number;
}

export interface TeacherSignupData {
  email: string;
  password: string;
  name: string;
  subject: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: string;
  email: string;
  name: string;
  type: 'student' | 'teacher';
  grade?: number;
  subject?: string;
  message: string;
}

class AuthService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  // Student authentication
  async studentSignup(data: StudentSignupData): Promise<AuthResponse> {
    try {
      const response = await this.api.post('/auth/student/signup', data);
      return { ...response.data, type: 'student' as const };
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Signup failed. Please try again.');
    }
  }

  async studentLogin(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await this.api.post('/auth/student/login', data);
      return { ...response.data, type: 'student' as const };
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Login failed. Please try again.');
    }
  }

  // Teacher authentication
  async teacherSignup(data: TeacherSignupData): Promise<AuthResponse> {
    try {
      const response = await this.api.post('/auth/teacher/signup', data);
      return { ...response.data, type: 'teacher' as const };
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Signup failed. Please try again.');
    }
  }

  async teacherLogin(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await this.api.post('/auth/teacher/login', data);
      return { ...response.data, type: 'teacher' as const };
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Login failed. Please try again.');
    }
  }
}

export const authService = new AuthService();
