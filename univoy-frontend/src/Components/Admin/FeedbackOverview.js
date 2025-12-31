import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Rating,
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
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { feedbackService } from '../../Services/feedbackService';

const FeedbackOverview = () => {
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFeedbackData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const [feedbackData, statsData] = await Promise.all([
          feedbackService.getAllFeedback(),
          feedbackService.getFeedbackStats()
        ]);
        
        setFeedback(feedbackData.feedback || []);
        setStats(statsData);
      } catch (err) {
        console.error('Error fetching feedback data:', err);
        setError('Failed to load feedback data');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbackData();
  }, []);

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

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <FeedbackIcon sx={{ fontSize: 30, color: '#4CAF50' }} />
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#22502C' }}>
          Student Feedback Overview
        </Typography>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#4CAF50' }}>
                    <FeedbackIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.totalFeedback}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Feedback
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#FFD700' }}>
                    <StarIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.averageRating}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Rating
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#2196F3' }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.ratingDistribution?.find(r => r._id >= 4)?.count || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Excellent Ratings (4-5)
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Rating Distribution */}
      {stats?.ratingDistribution && (
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: "#22502C", fontWeight: "bold" }}>
            Rating Distribution
          </Typography>
          <Grid container spacing={2}>
            {stats.ratingDistribution.map((rating) => (
              <Grid item xs={12} sm={6} md={2.4} key={rating._id}>
                <Card elevation={1}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                      <Rating value={rating._id} readOnly size="small" />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {rating.count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {rating._id} Star{rating._id > 1 ? 's' : ''}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Recent Feedback */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, color: "#22502C", fontWeight: "bold" }}>
          Recent Feedback
        </Typography>
        
        {feedback.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <FeedbackIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Feedback Available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Students haven't submitted any feedback yet.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {feedback.slice(0, 6).map((item, index) => (
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
        )}
      </Paper>
    </Box>
  );
};

export default FeedbackOverview; 