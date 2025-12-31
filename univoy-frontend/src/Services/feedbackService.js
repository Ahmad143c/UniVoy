import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const FEEDBACK_API_URL = `${API_URL}/api/feedback`;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const feedbackService = {
  // Submit feedback
  submitFeedback: async (feedbackData) => {
    try {
      console.log('Submitting feedback:', feedbackData);
      const res = await axios.post(FEEDBACK_API_URL, feedbackData, {
        headers: getAuthHeaders()
      });
      console.log('Feedback submitted successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },

  // Get feedback for a specific student
  getStudentFeedback: async (studentId) => {
    try {
      console.log('Fetching feedback for student:', studentId);
      const res = await axios.get(`${FEEDBACK_API_URL}/student/${studentId}`, {
        headers: getAuthHeaders()
      });
      console.log('Student feedback fetched successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error fetching student feedback:', error);
      throw error;
    }
  },

  // Get all feedback (for admin)
  getAllFeedback: async () => {
    try {
      console.log('Fetching all feedback');
      const res = await axios.get(FEEDBACK_API_URL, {
        headers: getAuthHeaders()
      });
      console.log('All feedback fetched successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error fetching all feedback:', error);
      throw error;
    }
  },

  // Get feedback statistics (for admin)
  getFeedbackStats: async () => {
    try {
      console.log('Fetching feedback statistics');
      const res = await axios.get(`${FEEDBACK_API_URL}/stats`, {
        headers: getAuthHeaders()
      });
      console.log('Feedback stats fetched successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
      throw error;
    }
  }
}; 