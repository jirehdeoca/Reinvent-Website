-- Seed Data for Reinvent International Platform
-- Initial programs, modules, and sample content

-- Insert Programs
INSERT INTO programs (id, name, slug, description, long_description, price, duration_weeks, biblical_foundation, learning_outcomes, prerequisites, target_audience, program_type, is_active, curriculum_overview) VALUES
(
  gen_random_uuid(),
  'Reinvent 1: Foundation',
  'reinvent-1-foundation',
  'Build your leadership foundation with core biblical principles and essential business skills.',
  'Reinvent 1: Foundation is designed for emerging leaders who want to build their leadership capabilities on a solid biblical foundation. This comprehensive 12-week program combines biblical wisdom with proven leadership methodologies, creating a unique learning experience that transforms not just what you do as a leader, but who you are.',
  1497.00,
  12,
  'Servant leadership modeled by Jesus Christ, stewardship principles, and character development through biblical wisdom.',
  ARRAY['Biblical leadership foundation', 'Character development', 'Communication excellence', 'Team building skills', 'Purpose-driven leadership', 'Ethical decision making'],
  'No prior leadership experience required. Open heart to integrate faith with professional development.',
  ARRAY['Emerging leaders', 'Career transitioners', 'Ministry leaders', 'Purpose seekers'],
  'foundation',
  true,
  '{"modules": 12, "weekly_commitment": "4-5 hours", "live_sessions": "Weekly 2-hour workshops", "self_study": "2-3 hours per week"}'
),
(
  gen_random_uuid(),
  'Reinvent 2: Advanced',
  'reinvent-2-advanced',
  'Advanced leadership strategies for experienced professionals ready to take their faith-based leadership to the next level.',
  'Building on the foundation principles, Reinvent 2 focuses on advanced leadership strategies, organizational transformation, and complex decision-making through biblical wisdom.',
  2497.00,
  16,
  'Advanced biblical leadership examples from Nehemiah, Daniel, and Paul. Strategic thinking with divine guidance.',
  ARRAY['Strategic thinking and planning', 'Organizational transformation', 'Conflict resolution', 'Mentoring and coaching', 'Change management', 'Executive presence'],
  'Completion of Reinvent 1 or equivalent leadership experience. Current leadership role preferred.',
  ARRAY['Experienced leaders', 'Executives', 'Senior managers', 'Organizational leaders'],
  'advanced',
  true,
  '{"modules": 16, "weekly_commitment": "6-8 hours", "live_sessions": "Bi-weekly 3-hour intensives", "self_study": "4-5 hours per week"}'
),
(
  gen_random_uuid(),
  'Leadership Lab',
  'leadership-lab',
  'Hands-on workshop series for practicing leaders to apply biblical principles in real-world business scenarios.',
  'Interactive workshop series focusing on practical application of biblical leadership principles in contemporary business challenges.',
  897.00,
  8,
  'Case studies from biblical leaders applied to modern business scenarios.',
  ARRAY['Case study analysis', 'Peer learning', 'Action planning', 'Accountability partnerships', 'Real-world application'],
  'Current leadership role and basic understanding of biblical principles.',
  ARRAY['Practicing leaders', 'Team leaders', 'Project managers'],
  'workshop',
  true,
  '{"modules": 8, "weekly_commitment": "3-4 hours", "format": "Interactive workshops", "peer_learning": true}'
),
(
  gen_random_uuid(),
  'Certification Pathway',
  'certification-pathway',
  'Comprehensive certification program for those called to teach and coach others in biblical leadership principles.',
  'Train-the-trainer certification program for leaders who want to facilitate biblical leadership development in their organizations or as professional coaches.',
  3997.00,
  24,
  'Biblical model of discipleship and multiplication. Teaching and coaching methodologies from Scripture.',
  ARRAY['Train-the-trainer methodology', 'Coaching certification', 'Biblical counseling skills', 'Business development support', 'Curriculum mastery'],
  'Completion of Reinvent 1 and 2, or equivalent experience. Calling to teach/coach others.',
  ARRAY['Aspiring coaches', 'HR professionals', 'Ministry leaders', 'Trainers'],
  'certification',
  true,
  '{"modules": 24, "weekly_commitment": "8-10 hours", "practicum": "Required coaching hours", "certification": "Accredited certificate"}'
);

-- Get program IDs for module insertion
DO $$
DECLARE
    reinvent1_id UUID;
    reinvent2_id UUID;
    lab_id UUID;
    cert_id UUID;
BEGIN
    SELECT id INTO reinvent1_id FROM programs WHERE slug = 'reinvent-1-foundation';
    SELECT id INTO reinvent2_id FROM programs WHERE slug = 'reinvent-2-advanced';
    SELECT id INTO lab_id FROM programs WHERE slug = 'leadership-lab';
    SELECT id INTO cert_id FROM programs WHERE slug = 'certification-pathway';

    -- Reinvent 1 Modules
    INSERT INTO modules (program_id, title, description, biblical_principle, scripture_references, reflection_questions, practical_exercises, order_index, video_duration_minutes, is_published) VALUES
    (reinvent1_id, 'Called to Lead', 'Understanding leadership as a calling from God and discovering your unique leadership gifts and purpose.', 'Divine calling and stewardship', ARRAY['1 Peter 4:10', 'Ephesians 2:10', 'Jeremiah 1:5'], ARRAY['How has God uniquely gifted you for leadership?', 'What fears or doubts hold you back from embracing your calling?'], ARRAY['Leadership gifts assessment', 'Personal calling statement', 'Fear inventory and prayer'], 1, 45, true),
    (reinvent1_id, 'Servant Leadership', 'Learning from Jesus'' model of servant leadership and how it applies to modern business contexts.', 'Servant leadership', ARRAY['Mark 10:43-44', 'John 13:1-17', 'Philippians 2:3-8'], ARRAY['How does servant leadership challenge conventional leadership thinking?', 'Where can you serve your team more effectively?'], ARRAY['Servant leadership self-assessment', 'Team service project planning', 'Foot washing reflection'], 2, 50, true),
    (reinvent1_id, 'Character & Integrity', 'Building the character foundation that makes leadership sustainable and trustworthy.', 'Character formation', ARRAY['Proverbs 27:19', '1 Timothy 3:1-7', 'Daniel 6:3-4'], ARRAY['What character qualities do you most need to develop?', 'How does your private life align with your public leadership?'], ARRAY['Character assessment', 'Integrity audit', 'Accountability partner selection'], 3, 40, true),
    (reinvent1_id, 'Effective Communication', 'Developing clear, honest, and inspiring communication skills rooted in biblical principles.', 'Truth in love', ARRAY['Ephesians 4:15', 'Proverbs 18:21', 'James 1:19'], ARRAY['How can you communicate truth with greater love?', 'What communication habits need to change?'], ARRAY['Communication style assessment', 'Difficult conversation practice', 'Listening skills development'], 4, 55, true),
    (reinvent1_id, 'Building Trust', 'Creating and maintaining trust through consistency, transparency, and reliability.', 'Faithfulness and reliability', ARRAY['Luke 16:10', '1 Corinthians 4:2', 'Proverbs 25:19'], ARRAY['Where have you broken trust and how can you rebuild it?', 'What makes you trustworthy as a leader?'], ARRAY['Trust assessment with team', 'Consistency tracking', 'Transparency practice'], 5, 42, true),
    (reinvent1_id, 'Conflict Resolution', 'Handling conflict with grace and wisdom, following biblical principles for reconciliation.', 'Peacemaking and reconciliation', ARRAY['Matthew 18:15-17', 'Romans 12:18', 'Ephesians 4:26-27'], ARRAY['How do you typically respond to conflict?', 'What relationships need reconciliation?'], ARRAY['Conflict style assessment', 'Reconciliation conversation practice', 'Peacemaking plan'], 6, 48, true),
    (reinvent1_id, 'Building Teams', 'Creating unified, diverse teams that reflect biblical principles of community and collaboration.', 'Unity in diversity', ARRAY['1 Corinthians 12:12-27', 'Ephesians 4:11-16', 'Ecclesiastes 4:12'], ARRAY['How can you better value diversity on your team?', 'What creates unity without uniformity?'], ARRAY['Team dynamics assessment', 'Diversity appreciation exercise', 'Unity building activities'], 7, 52, true),
    (reinvent1_id, 'Motivating Others', 'Inspiring and encouraging team members through purpose, recognition, and development.', 'Encouragement and edification', ARRAY['1 Thessalonians 5:11', 'Hebrews 10:24', 'Proverbs 27:17'], ARRAY['How do you currently motivate your team?', 'What motivates you most deeply?'], ARRAY['Motivation assessment', 'Recognition program design', 'Encouragement practice'], 8, 46, true),
    (reinvent1_id, 'Delegation & Empowerment', 'Empowering others to grow and contribute while maintaining accountability and support.', 'Multiplication and empowerment', ARRAY['Exodus 18:17-23', '2 Timothy 2:2', 'Luke 10:1-20'], ARRAY['What prevents you from delegating effectively?', 'How can you better empower your team?'], ARRAY['Delegation assessment', 'Empowerment plan', 'Accountability system design'], 9, 44, true),
    (reinvent1_id, 'Vision & Planning', 'Developing and communicating compelling vision while seeking God''s guidance in planning.', 'Vision and divine guidance', ARRAY['Proverbs 29:18', 'Habakkuk 2:2-3', 'Jeremiah 29:11'], ARRAY['What vision has God given you for your leadership?', 'How do you seek God''s guidance in planning?'], ARRAY['Vision development exercise', 'Strategic planning with prayer', 'Vision communication practice'], 10, 50, true),
    (reinvent1_id, 'Decision Making', 'Making wise decisions under pressure using biblical wisdom and practical frameworks.', 'Wisdom and discernment', ARRAY['Proverbs 27:14', 'James 1:5', '1 Kings 3:9'], ARRAY['How do you currently make difficult decisions?', 'Where do you need more wisdom?'], ARRAY['Decision-making framework', 'Wisdom seeking practice', 'Pressure decision simulation'], 11, 47, true),
    (reinvent1_id, 'Leading Change', 'Guiding organizations through change with faith, courage, and strategic thinking.', 'Courage and perseverance', ARRAY['Joshua 1:9', 'Nehemiah 4:14', 'Isaiah 43:19'], ARRAY['How do you respond to change personally?', 'What changes is God calling you to lead?'], ARRAY['Change readiness assessment', 'Change leadership plan', 'Courage building exercises'], 12, 53, true);

    -- Sample modules for other programs (abbreviated for space)
    INSERT INTO modules (program_id, title, description, biblical_principle, scripture_references, order_index, video_duration_minutes, is_published) VALUES
    (reinvent2_id, 'Strategic Leadership Vision', 'Advanced strategic thinking and long-term vision development through biblical wisdom.', 'Strategic vision', ARRAY['Nehemiah 2:11-20', 'Proverbs 21:5'], 1, 60, true),
    (reinvent2_id, 'Organizational Transformation', 'Leading large-scale organizational change using biblical principles of transformation.', 'Transformation and renewal', ARRAY['2 Corinthians 5:17', 'Romans 12:2'], 2, 65, true),
    (lab_id, 'Crisis Leadership Case Study', 'Analyzing how biblical leaders handled crisis situations and applying lessons to modern challenges.', 'Crisis leadership', ARRAY['Nehemiah 1:1-11', 'Esther 4:14'], 1, 90, true),
    (cert_id, 'Biblical Coaching Methodology', 'Learning to coach others using biblical principles and proven methodologies.', 'Discipleship and mentoring', ARRAY['2 Timothy 2:2', 'Titus 2:3-5'], 1, 75, true);
END $$;

-- Insert Discussion Forums
INSERT INTO discussion_forums (title, description, category, is_private, is_moderated) VALUES
('General Leadership Discussion', 'Open discussion about biblical leadership principles and practical application', 'general', false, true),
('Biblical Leadership Insights', 'Share insights and revelations from Scripture about leadership', 'biblical_leadership', false, true),
('Workplace Faith Integration', 'Discuss challenges and victories in integrating faith at work', 'workplace_faith', false, true),
('Prayer Requests', 'Share prayer requests and pray for one another', 'prayer', false, true),
('Testimonies & Success Stories', 'Share how God has worked through your leadership journey', 'testimonies', false, true);

-- Insert Sample Events
INSERT INTO events (title, description, event_type, start_time, end_time, is_virtual, max_attendees, registration_fee, is_published) VALUES
('Biblical Leadership in Crisis', 'Learn how to lead with faith and wisdom during challenging times', 'webinar', NOW() + INTERVAL '30 days', NOW() + INTERVAL '30 days' + INTERVAL '90 minutes', true, 100, 0, true),
('Faith & Work Integration Workshop', 'Practical strategies for integrating your faith in the workplace', 'workshop', NOW() + INTERVAL '45 days', NOW() + INTERVAL '45 days' + INTERVAL '4 hours', true, 50, 97, true),
('Annual Leadership Conference', 'Three-day intensive conference on biblical leadership excellence', 'conference', NOW() + INTERVAL '90 days', NOW() + INTERVAL '93 days', false, 200, 297, true);

-- Insert Sample Testimonials
INSERT INTO testimonials (title, content, professional_impact, spiritual_growth, rating, is_featured, is_approved) VALUES
('Transformed My Leadership Approach', 'The Reinvent program helped me integrate my faith with my leadership style in a way that transformed not just my career, but my entire approach to serving others. I learned that being a Christian leader isn''t about hiding my faith, but about letting it guide every decision I make.', 'Promoted to VP within 6 months of completing the program. Team engagement scores increased by 40%.', 'Developed a daily prayer and reflection practice. Gained confidence in sharing my faith appropriately at work.', 5, true, true),
('Found My Calling', 'I never thought I could be both a successful business leader and stay true to my Christian values. This program showed me how they actually strengthen each other. The biblical foundation gave me the confidence and wisdom to lead with integrity.', 'Started my own consulting firm focused on ethical business practices. Revenue grew 200% in first year.', 'Deepened my understanding of God''s calling on my life. Started mentoring other Christian professionals.', 5, true, true),
('Practical and Transformational', 'The combination of biblical wisdom and practical business skills was exactly what I needed. The program didn''t just teach me leadership techniques, it transformed my character and gave me a solid foundation for making difficult decisions.', 'Successfully led a major organizational restructuring with minimal turnover. Team morale actually improved during the transition.', 'Learned to seek God''s wisdom in all decisions. Developed stronger prayer life and biblical study habits.', 5, false, true);

-- Insert Sample Prayer Requests
INSERT INTO prayer_requests (title, request_text, category, is_public) VALUES
('Wisdom for Difficult Decision', 'Please pray for wisdom as I navigate a challenging situation at work involving potential layoffs. I want to lead with both compassion and business wisdom.', 'work', true),
('Team Unity', 'Pray for unity on my team. We''ve been experiencing conflict and I need God''s guidance on how to bring healing and restoration.', 'work', true),
('Personal Growth', 'Pray for my character development as a leader. I struggle with pride and want to become more humble and servant-hearted.', 'personal', true);

-- Insert Newsletter Subscription Types
INSERT INTO newsletter_subscriptions (email, name, subscription_type, source_page) VALUES
('demo@example.com', 'Demo User', 'weekly_insights', 'homepage'),
('test@example.com', 'Test User', 'program_updates', 'resources');

-- Insert Sample Resource Downloads
INSERT INTO resource_downloads (user_email, user_name, resource_type, resource_name, source_page) VALUES
('demo@example.com', 'Demo User', 'assessment', 'Biblical Leadership Assessment', 'resources'),
('test@example.com', 'Test User', 'guide', 'Faith & Work Integration Guide', 'resources');

-- Insert Sample Contact Submissions
INSERT INTO contact_submissions (name, email, company, inquiry_type, message, source_page, status) VALUES
('John Smith', 'john@company.com', 'Tech Solutions Inc', 'corporate', 'Interested in corporate training for our leadership team of 15 people.', 'corporate', 'new'),
('Sarah Johnson', 'sarah@nonprofit.org', 'Faith Community Center', 'programs', 'Would like to learn more about the certification pathway for our ministry leaders.', 'certification', 'new');

