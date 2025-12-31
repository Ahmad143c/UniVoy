import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Rating,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Avatar,
  Stack
} from '@mui/material';
import {
  Star as StarIcon,
  Feedback as FeedbackIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { feedbackService } from '../../Services/feedbackService';

const FeedbackDisplay = ({ studentId, studentName }) => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (studentId) {
          const data = await feedbackService.getStudentFeedback(studentId);
          setFeedback(data.feedback || []);
        } else {
          const data = await feedbackService.getAllFeedback();
          setFeedback(data.feedback || []);
        }
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError('Failed to load feedback');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [studentId]);

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'success';
    if (rating >= 3) return 'warning';
    return 'error';
  };

  const getRatingText = (rating) => {
    if (rating >= 4) return 'Excellent';
    if (rating >= 3) return 'Good';
    if (rating >= 2) return 'Fair';
    return 'Poor';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (feedback.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <FeedbackIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Feedback Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {studentId ? 'This student has not submitted any feedback yet.' : 'No feedback has been submitted yet.'}
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <FeedbackIcon sx={{ fontSize: 30, color: '#4CAF50' }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#22502C' }}>
          {studentId ? `${studentName}'s Feedback` : 'All Student Feedback'}
        </Typography>
        <Chip 
          label={`${feedback.length} feedback${feedback.length > 1 ? 's' : ''}`} 
          color="primary" 
          size="small" 
        />
      </Box>

      <Grid container spacing={2}>
        {feedback.map((item, index) => (
          <Grid item xs={12} md={6} key={item._id || index}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#4CAF50' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {item.studentName || 'Anonymous'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(item.submittedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>
                  <Chip
                    label={getRatingText(item.rating)}
                    color={getRatingColor(item.rating)}
                    size="small"
                    icon={<StarIcon />}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Rating
                    value={item.rating}
                    readOnly
                    size="small"
                    sx={{
                      '& .MuiRating-iconFilled': {
                        color: '#FFD700',
                      },
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    ({item.rating}/5)
                  </Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                  {item.feedback}
                </Typography>

                {item.studentEmail && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Email: {item.studentEmail}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeedbackDisplay; 