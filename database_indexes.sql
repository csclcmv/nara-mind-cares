-- Create indexes for better performance

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_mood_entries_user_date ON mood_entries(user_id, timestamp);
CREATE INDEX idx_appointments_student ON appointments(student_id);
CREATE INDEX idx_appointments_counselor ON appointments(counselor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_forum_posts_created ON forum_posts(created_at);
CREATE INDEX idx_chat_sessions_user_time ON chat_sessions(user_id, timestamp);
CREATE INDEX idx_activity_log_user_time ON user_activity_log(user_id, timestamp);
