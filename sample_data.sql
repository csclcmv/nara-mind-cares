-- Sample data for NeuroConnect

-- Insert sample users
INSERT INTO users (email, password_hash, full_name, role, university_id, phone_number) VALUES
('student1@university.edu', 'hashed_password_1', 'Alice Johnson', 'student', 'STU001', '+1234567890'),
('student2@university.edu', 'hashed_password_2', 'Bob Smith', 'student', 'STU002', '+1234567891'),
('dr.rodriguez@university.edu', 'hashed_password_3', 'Dr. Emily Rodriguez', 'therapist', 'THER001', '+1234567892'),
('dr.kumar@university.edu', 'hashed_password_4', 'Dr. Priya Kumar', 'therapist', 'THER002', '+1234567893'),
('admin@neuroconnect.edu', 'hashed_password_5', 'System Admin', 'admin', 'ADMIN001', '+1234567894');

-- Insert therapist profiles
INSERT INTO therapists (therapist_id, specialization, qualifications, experience_years, bio_description) VALUES
(3, 'Academic Pressure & Performance', 'PhD in Clinical Psychology, Licensed Therapist', 8, 'Specialized in helping students manage academic stress and improve performance.'),
(4, 'Anxiety & Depression', 'Masters in Counseling Psychology, Certified CBT Practitioner', 5, 'Experienced in supporting students through anxiety, depression, and life transitions.');

-- Insert sample mood entries
INSERT INTO mood_entries (user_id, mood_score, notes) VALUES
(1, 4, 'Feeling good about my project progress'),
(1, 3, 'A bit stressed about upcoming exams'),
(2, 2, 'Struggling with sleep lately');

-- Insert sample appointments
INSERT INTO appointments (student_id, counselor_id, appointment_date, appointment_time, status, notes) VALUES
(1, 3, '2024-01-15', '14:00:00', 'scheduled', 'Discussion about exam stress'),
(2, 4, '2024-01-16', '16:30:00', 'scheduled', 'Follow-up session');

-- Insert sample forum posts
INSERT INTO forum_posts (anonymous_id, title, content) VALUES
('anon_123', 'Feeling overwhelmed with finals', 'Anyone else struggling to balance studying and self-care during finals?'),
('anon_456', 'Tips for better sleep', 'What routines help you get quality sleep during stressful periods?');

-- Insert system configuration
INSERT INTO system_config (config_key, config_value) VALUES
('maintenance_mode', 'false'),
('session_timeout_minutes', '30'),
('max_login_attempts', '5');
