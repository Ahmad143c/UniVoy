import api from './api';

export const studentService = {
  getProfile: async () => {
    const response = await api.get('/students/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/students/profile', profileData);
    return response.data;
  },

  getApplications: async () => {
    const response = await api.get('/course-applications');
    return response.data;
  },

  submitApplication: async (applicationData) => {
    const response = await api.post('/course-applications', applicationData);
    return response.data;
  },

  getUniversities: async () => {
    const response = await api.get('/universities');
    return response.data;
  },

  getUniversityDetails: async (universityId) => {
    const response = await api.get(`/universities/${universityId}`);
    return response.data;
  },

  getUniversityDocuments: async (studentId) => {
    const response = await api.get(`/students/${studentId}/university-documents`);
    return response.data.universityDocuments;
  }
};

export default studentService; 