-- Reinvent International Database Schema
-- Comprehensive schema for faith-based leadership training platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Authentication and User Management
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  company TEXT,
  role TEXT,
  phone TEXT,
  faith_journey_stage TEXT CHECK (faith_journey_stage IN ('new_believer', 'growing', 'mature', 'leader')),
  leadership_experience TEXT CHECK (leadership_experience IN ('none', 'emerging', 'experienced', 'senior')),
  bio TEXT,
  profile_image_url TEXT,
  linkedin_url TEXT,
  is_coach BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Programs and Courses
CREATE TABLE programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  long_description TEXT,
  price DECIMAL(10,2),
  duration_weeks INTEGER,
  biblical_foundation TEXT,
  learning_outcomes TEXT[],
  prerequisites TEXT,
  target_audience TEXT[],
  program_type TEXT CHECK (program_type IN ('foundation', 'advanced', 'certification', 'workshop')),
  is_active BOOLEAN DEFAULT true,
  featured_image_url TEXT,
  curriculum_overview JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course Modules
CREATE TABLE modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB,
  biblical_principle TEXT,
  scripture_references TEXT[],
  reflection_questions TEXT[],
  practical_exercises TEXT[],
  order_index INTEGER,
  video_url TEXT,
  video_duration_minutes INTEGER,
  resources JSONB,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Enrollments
CREATE TABLE enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_amount DECIMAL(10,2),
  stripe_payment_id TEXT,
  stripe_customer_id TEXT,
  access_expires_at TIMESTAMP WITH TIME ZONE,
  certificate_issued_at TIMESTAMP WITH TIME ZONE,
  certificate_url TEXT,
  UNIQUE(user_id, program_id)
);

-- Progress Tracking
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER DEFAULT 0,
  reflection_notes TEXT,
  biblical_insights TEXT,
  action_items TEXT[],
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  UNIQUE(user_id, module_id)
);

-- Coaching System
CREATE TABLE coaches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  specializations TEXT[],
  bio TEXT,
  experience_years INTEGER,
  certifications TEXT[],
  hourly_rate DECIMAL(10,2),
  availability_schedule JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE coaching_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES coaches(id),
  client_id UUID REFERENCES profiles(id),
  scheduled_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 60,
  session_type TEXT CHECK (session_type IN ('initial', 'regular', 'follow_up', 'group')),
  session_notes TEXT,
  prayer_requests TEXT,
  action_items TEXT[],
  client_feedback TEXT,
  coach_feedback TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  zoom_meeting_id TEXT,
  zoom_meeting_url TEXT,
  payment_amount DECIMAL(10,2),
  stripe_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Features
CREATE TABLE discussion_forums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('general', 'biblical_leadership', 'workplace_faith', 'prayer', 'testimonies')),
  created_by UUID REFERENCES profiles(id),
  is_private BOOLEAN DEFAULT false,
  is_moderated BOOLEAN DEFAULT true,
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE forum_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  forum_id UUID REFERENCES discussion_forums(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  biblical_reference TEXT,
  parent_post_id UUID REFERENCES forum_posts(id),
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  like_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Prayer Requests
CREATE TABLE prayer_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  request_text TEXT NOT NULL,
  category TEXT CHECK (category IN ('personal', 'family', 'work', 'ministry', 'health', 'other')),
  is_anonymous BOOLEAN DEFAULT false,
  is_answered BOOLEAN DEFAULT false,
  answer_text TEXT,
  answered_at TIMESTAMP WITH TIME ZONE,
  prayer_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE prayer_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prayer_request_id UUID REFERENCES prayer_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  response_text TEXT,
  is_praying BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials
CREATE TABLE testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  program_id UUID REFERENCES programs(id),
  title TEXT,
  content TEXT NOT NULL,
  professional_impact TEXT,
  spiritual_growth TEXT,
  before_after JSONB,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Forms and Leads
CREATE TABLE contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  inquiry_type TEXT CHECK (inquiry_type IN ('general', 'programs', 'coaching', 'corporate', 'speaking', 'partnership')),
  message TEXT,
  source_page TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
  assigned_to UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter Subscriptions
CREATE TABLE newsletter_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscription_type TEXT DEFAULT 'weekly_insights',
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  source_page TEXT,
  preferences JSONB
);

-- Resource Downloads
CREATE TABLE resource_downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT,
  resource_type TEXT NOT NULL,
  resource_name TEXT NOT NULL,
  download_url TEXT,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source_page TEXT
);

-- Events and Webinars
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN ('webinar', 'workshop', 'conference', 'networking')),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  timezone TEXT,
  is_virtual BOOLEAN DEFAULT true,
  location TEXT,
  max_attendees INTEGER,
  registration_fee DECIMAL(10,2) DEFAULT 0,
  zoom_meeting_id TEXT,
  zoom_meeting_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE event_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attended BOOLEAN DEFAULT false,
  payment_status TEXT DEFAULT 'free' CHECK (payment_status IN ('free', 'paid', 'pending', 'failed')),
  stripe_payment_id TEXT,
  UNIQUE(event_id, user_id)
);

-- Notifications System
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')),
  category TEXT CHECK (category IN ('system', 'course', 'community', 'coaching', 'payment')),
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics and Tracking
CREATE TABLE user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_data JSONB,
  page_url TEXT,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_program_id ON enrollments(program_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_module_id ON user_progress(module_id);
CREATE INDEX idx_forum_posts_forum_id ON forum_posts(forum_id);
CREATE INDEX idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX idx_coaching_sessions_coach_id ON coaching_sessions(coach_id);
CREATE INDEX idx_coaching_sessions_client_id ON coaching_sessions(client_id);
CREATE INDEX idx_prayer_requests_user_id ON prayer_requests(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

