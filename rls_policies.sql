-- Row Level Security (RLS) Policies for Reinvent International
-- Ensures users can only access their own data and appropriate public content

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Public profiles viewable by authenticated users" ON profiles
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    (is_coach = true OR id IN (
      SELECT DISTINCT coach_id FROM coaches WHERE is_active = true
    ))
  );

-- Enrollments policies
CREATE POLICY "Users can view own enrollments" ON enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own enrollments" ON enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollments" ON enrollments
  FOR UPDATE USING (auth.uid() = user_id);

-- User progress policies
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Coaches policies
CREATE POLICY "Anyone can view active coaches" ON coaches
  FOR SELECT USING (is_active = true);

CREATE POLICY "Coaches can update own profile" ON coaches
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
  );

CREATE POLICY "Coaches can insert own profile" ON coaches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Coaching sessions policies
CREATE POLICY "Coaches and clients can view their sessions" ON coaching_sessions
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM coaches WHERE id = coach_id
    ) OR 
    auth.uid() = client_id
  );

CREATE POLICY "Coaches and clients can update their sessions" ON coaching_sessions
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM coaches WHERE id = coach_id
    ) OR 
    auth.uid() = client_id
  );

CREATE POLICY "Authenticated users can book sessions" ON coaching_sessions
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Forum posts policies
CREATE POLICY "Anyone can view public forum posts" ON forum_posts
  FOR SELECT USING (
    forum_id IN (
      SELECT id FROM discussion_forums WHERE is_private = false
    )
  );

CREATE POLICY "Authenticated users can create posts" ON forum_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON forum_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON forum_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Post likes policies
CREATE POLICY "Users can view all likes" ON post_likes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can like posts" ON post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts" ON post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Prayer requests policies
CREATE POLICY "Users can view public prayer requests" ON prayer_requests
  FOR SELECT USING (
    is_public = true OR 
    auth.uid() = user_id
  );

CREATE POLICY "Users can create prayer requests" ON prayer_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prayer requests" ON prayer_requests
  FOR UPDATE USING (auth.uid() = user_id);

-- Prayer responses policies
CREATE POLICY "Users can view prayer responses" ON prayer_responses
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    prayer_request_id IN (
      SELECT id FROM prayer_requests WHERE is_public = true
    )
  );

CREATE POLICY "Users can create prayer responses" ON prayer_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Testimonials policies
CREATE POLICY "Anyone can view approved testimonials" ON testimonials
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can view own testimonials" ON testimonials
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create testimonials" ON testimonials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own testimonials" ON testimonials
  FOR UPDATE USING (auth.uid() = user_id);

-- Contact submissions policies (admin only)
CREATE POLICY "Admins can view contact submissions" ON contact_submissions
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
  );

CREATE POLICY "Anyone can create contact submissions" ON contact_submissions
  FOR INSERT WITH CHECK (true);

-- Newsletter subscriptions policies
CREATE POLICY "Users can manage own subscription" ON newsletter_subscriptions
  FOR ALL USING (
    email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Anyone can subscribe" ON newsletter_subscriptions
  FOR INSERT WITH CHECK (true);

-- Resource downloads policies
CREATE POLICY "Users can view own downloads" ON resource_downloads
  FOR SELECT USING (
    user_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Anyone can download resources" ON resource_downloads
  FOR INSERT WITH CHECK (true);

-- Event registrations policies
CREATE POLICY "Users can view own registrations" ON event_registrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can register for events" ON event_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- User activity policies
CREATE POLICY "Users can view own activity" ON user_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can log user activity" ON user_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies for all tables
CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
  );

CREATE POLICY "Admins have full access to enrollments" ON enrollments
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
  );

CREATE POLICY "Admins have full access to user_progress" ON user_progress
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
  );

CREATE POLICY "Admins have full access to coaching_sessions" ON coaching_sessions
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
  );

CREATE POLICY "Admins have full access to testimonials" ON testimonials
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
  );

-- Public read access for certain tables
CREATE POLICY "Public read access to programs" ON programs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read access to modules" ON modules
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public read access to discussion_forums" ON discussion_forums
  FOR SELECT USING (is_private = false);

CREATE POLICY "Public read access to events" ON events
  FOR SELECT USING (is_published = true);

