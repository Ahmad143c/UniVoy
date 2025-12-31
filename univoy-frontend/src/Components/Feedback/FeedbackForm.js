import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Rating,
  TextField,
  Button,
  Alert,
  Divider,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import {
  Star as StarIcon,
  Send as SendIcon,
  Feedback as FeedbackIcon
} from '@mui/icons-material';

const FeedbackForm = ({ onSubmit, currentUser }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  console.log('FeedbackForm - currentUser:', currentUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }

    if (!feedback.trim()) {
      setError('Please provide feedback');
      return;
    }

    if (!currentUser || !currentUser.id) {
      setError('User information not available. Please log in again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const feedbackData = {
        studentId: currentUser.id,
        studentName: currentUser.username,
        studentEmail: currentUser.email,
        rating: rating,
        feedback: feedback.trim(),
        submittedAt: new Date().toISOString()
      };

      await onSubmit(feedbackData);
      setSubmitted(true);
      setRating(0);
      setFeedback('');
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setRating(0);
    setFeedback('');
    setError('');
  };

  if (submitted) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <FeedbackIcon sx={{ fontSize: 60, color: '#4CAF50', mb: 2 }} />
          <Typography variant="h6" color="primary" gutterBottom>
            Thank You for Your Feedback!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your feedback helps us improve our services. We appreciate your input.
          </Typography>
          <Button
            variant="outlined"
            onClick={handleReset}
            sx={{ mt: 2 }}
          >
            Submit Another Feedback
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <FeedbackIcon sx={{ fontSize: 30, color: '#4CAF50' }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#22502C' }}>
          Share Your Feedback
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Rate your experience with UniVoy:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Rating
                name="rating"
                value={rating}
                onChange={(event, newValue) => {
                  setRating(newValue);
                }}
                size="large"
                sx={{
                  '& .MuiRating-iconFilled': {
                    color: '#FFD700',
                  },
                  '& .MuiRating-iconHover': {
                    color: '#FFD700',
                  },
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {rating > 0 && `${rating} star${rating > 1 ? 's' : ''}`}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Tell us about your experience:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Share your thoughts about our services, consultants, or overall experience..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || rating === 0 || !feedback.trim()}
              startIcon={<SendIcon />}
              sx={{
                backgroundColor: '#4CAF50',
                '&:hover': {
                  backgroundColor: '#45a049',
                },
              }}
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </Grid>
        </Grid>
      </form>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
          What we value in your feedback:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          <Chip label="Service Quality" size="small" color="primary" />
          <Chip label="Consultant Support" size="small" color="primary" />
          <Chip label="Communication" size="small" color="primary" />
          <Chip label="Process Efficiency" size="small" color="primary" />
          <Chip label="Overall Experience" size="small" color="primary" />
        </Box>
      </Box>
    </Paper>
  );
};

export default FeedbackForm; 