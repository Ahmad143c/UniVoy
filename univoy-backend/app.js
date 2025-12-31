const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes); 