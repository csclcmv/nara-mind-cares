-- Useful queries for your application

-- Get all students
SELECT user_id, full_name, email FROM users WHERE role = 'student';

-- Get therapist appointments
SELECT a.appointment_date, a.appointment_time, u.full_name as student_name
FROM appointments a
JOIN users u ON a.student_id = u.user_id
WHERE a.counselor_id = 3;

-- Get mood history for a student
SELECT mood_score, notes, timestamp 
FROM mood_entries 
WHERE user_id = 1 
ORDER BY timestamp DESC;

-- Count daily active users
SELECT DATE(login_timestamp) as date, COUNT(DISTINCT user_id) as active_users
FROM user_sessions
GROUP BY DATE(login_timestamp)
ORDER BY date DESC;

-- Get recent forum posts
SELECT title, content, created_at 
FROM forum_posts 
WHERE is_approved = true 
ORDER BY created_at DESC 
LIMIT 10;
