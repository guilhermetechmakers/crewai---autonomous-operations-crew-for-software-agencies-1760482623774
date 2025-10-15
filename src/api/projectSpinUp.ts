import { api } from '@/lib/api';
import type { 
  ProjectSpinUp, 
  SpinUpConfiguration, 
  SpinUpTemplate, 
  SpinUpProgress,
  SpinUpLog,
  ApiResponse 
} from '@/types';

// Project Spin-Up API functions
export const projectSpinUpApi = {
  /**
   * Get available project templates
   */
  getTemplates: async (): Promise<SpinUpTemplate[]> => {
    try {
      const response = await api.get<ApiResponse<SpinUpTemplate[]>>('/spinup/templates');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      // Return fallback templates if API fails
      return [
        {
          id: 'nextjs-starter',
          name: 'Next.js Starter',
          description: 'Modern React framework with TypeScript and Tailwind CSS',
          category: 'web_app',
          framework: 'nextjs',
          features: ['TypeScript', 'Tailwind CSS', 'ESLint', 'Prettier'],
          estimated_setup_time: 5,
          complexity: 'beginner',
        },
        {
          id: 'react-vite',
          name: 'React + Vite',
          description: 'Fast React development with Vite bundler',
          category: 'web_app',
          framework: 'react',
          features: ['TypeScript', 'Vite', 'React Router', 'Zustand'],
          estimated_setup_time: 3,
          complexity: 'beginner',
        },
        {
          id: 'fullstack-nextjs',
          name: 'Full-Stack Next.js',
          description: 'Complete full-stack application with database and auth',
          category: 'fullstack',
          framework: 'nextjs',
          features: ['TypeScript', 'Prisma', 'NextAuth', 'PostgreSQL', 'Tailwind'],
          estimated_setup_time: 15,
          complexity: 'advanced',
        },
      ];
    }
  },

  /**
   * Initiate a new project spin-up
   */
  initiate: async (data: {
    name: string;
    description: string;
    configuration: SpinUpConfiguration;
  }): Promise<ProjectSpinUp> => {
    try {
      const response = await api.post<ApiResponse<ProjectSpinUp>>('/spinup/initiate', data);
      if (!response.data) {
        throw new Error('No data returned from spin-up initiation');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to initiate project spin-up:', error);
      throw error;
    }
  },

  /**
   * Get spin-up progress
   */
  getProgress: async (spinupId: string): Promise<SpinUpProgress> => {
    try {
      const response = await api.get<ApiResponse<SpinUpProgress>>(`/spinup/${spinupId}/progress`);
      if (!response.data) {
        throw new Error('No progress data returned');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch spin-up progress:', error);
      throw error;
    }
  },

  /**
   * Get spin-up logs
   */
  getLogs: async (spinupId: string): Promise<SpinUpLog[]> => {
    try {
      const response = await api.get<ApiResponse<SpinUpLog[]>>(`/spinup/${spinupId}/logs`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch spin-up logs:', error);
      return [];
    }
  },

  /**
   * Cancel a spin-up process
   */
  cancel: async (spinupId: string): Promise<boolean> => {
    try {
      const response = await api.post<ApiResponse<{ success: boolean }>>(`/spinup/${spinupId}/cancel`, {});
      return response.data?.success || false;
    } catch (error) {
      console.error('Failed to cancel spin-up:', error);
      throw error;
    }
  },

  /**
   * Get all user's spin-up projects
   */
  getProjects: async (): Promise<ProjectSpinUp[]> => {
    try {
      const response = await api.get<ApiResponse<ProjectSpinUp[]>>('/spinup/projects');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch spin-up projects:', error);
      return [];
    }
  },

  /**
   * Get a specific spin-up project
   */
  getProject: async (spinupId: string): Promise<ProjectSpinUp | null> => {
    try {
      const response = await api.get<ApiResponse<ProjectSpinUp>>(`/spinup/projects/${spinupId}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to fetch spin-up project:', error);
      return null;
    }
  },

  /**
   * Update spin-up configuration
   */
  updateConfiguration: async (
    spinupId: string, 
    configuration: Partial<SpinUpConfiguration>
  ): Promise<ProjectSpinUp> => {
    try {
      const response = await api.put<ApiResponse<ProjectSpinUp>>(
        `/spinup/projects/${spinupId}/configuration`, 
        configuration
      );
      if (!response.data) {
        throw new Error('No data returned from configuration update');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to update spin-up configuration:', error);
      throw error;
    }
  },

  /**
   * Retry a failed spin-up
   */
  retry: async (spinupId: string): Promise<ProjectSpinUp> => {
    try {
      const response = await api.post<ApiResponse<ProjectSpinUp>>(`/spinup/${spinupId}/retry`, {});
      if (!response.data) {
        throw new Error('No data returned from spin-up retry');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to retry spin-up:', error);
      throw error;
    }
  },
};
