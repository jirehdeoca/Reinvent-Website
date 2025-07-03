import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Authentication functions
export const signUp = async (email, password, userData) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  return { data, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// User Profile functions
export const getUserProfile = async (userId) => {
  return await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
}

export const updateUserProfile = async (userId, updates) => {
  return await supabase
    .from('user_profiles')
    .update(updates)
    .eq('user_id', userId)
}

// Program functions
export const getPrograms = async () => {
  return await supabase
    .from('programs')
    .select(`
      *,
      modules:program_modules(count)
    `)
    .eq('is_active', true)
    .order('display_order')
}

export const getProgram = async (programId) => {
  return await supabase
    .from('programs')
    .select(`
      *,
      modules:program_modules(*)
    `)
    .eq('id', programId)
    .single()
}

// Enrollment functions
export const createEnrollment = async (enrollmentData) => {
  return await supabase
    .from('enrollments')
    .insert(enrollmentData)
    .select()
    .single()
}

export const getEnrollments = async (userId = null) => {
  let query = supabase
    .from('enrollments')
    .select(`
      *,
      program:programs(*),
      user:user_profiles(*)
    `)

  if (userId) {
    query = query.eq('user_id', userId)
  }

  return query.order('created_at', { ascending: false })
}

export const getUserEnrollments = async (userId) => {
  return await supabase
    .from('enrollments')
    .select(`
      *,
      program:programs(*),
      progress:user_progress(*)
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
}

// Progress tracking functions
export const getUserProgress = async (userId, programId) => {
  return await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('program_id', programId)
}

export const updateModuleProgress = async (userId, moduleId, progressData) => {
  return await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      module_id: moduleId,
      ...progressData
    })
}

export const completeModule = async (userId, moduleId) => {
  return await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      module_id: moduleId,
      is_completed: true,
      completed_at: new Date().toISOString(),
      progress_percentage: 100
    })
}

// Forum functions
export const getForums = async () => {
  return await supabase
    .from('forums')
    .select(`
      *,
      post_count:forum_posts(count),
      last_post:forum_posts(
        id,
        title,
        created_at,
        author:user_profiles(full_name)
      )
    `)
    .eq('is_active', true)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
}

export const getForumPosts = async (forumId = null, limit = null) => {
  let query = supabase
    .from('forum_posts')
    .select(`
      *,
      author:user_profiles(full_name),
      forum:forums(name),
      reply_count:forum_replies(count),
      like_count:forum_likes(count)
    `)

  if (forumId) {
    query = query.eq('forum_id', forumId)
  }

  if (limit) {
    query = query.limit(limit)
  }

  return query.order('created_at', { ascending: false })
}

export const createForumPost = async (postData) => {
  return await supabase
    .from('forum_posts')
    .insert(postData)
    .select()
    .single()
}

export const getForumReplies = async (postId) => {
  return await supabase
    .from('forum_replies')
    .select(`
      *,
      author:user_profiles(full_name)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
}

export const createForumReply = async (replyData) => {
  return await supabase
    .from('forum_replies')
    .insert(replyData)
    .select()
    .single()
}

// Prayer request functions
export const getPrayerRequests = async () => {
  return await supabase
    .from('prayer_requests')
    .select(`
      *,
      author:user_profiles(full_name),
      supporters:prayer_supporters(
        user_id,
        user:user_profiles(full_name)
      ),
      responses:prayer_responses(
        *,
        author:user_profiles(full_name)
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
}

export const createPrayerRequest = async (requestData) => {
  return await supabase
    .from('prayer_requests')
    .insert(requestData)
    .select()
    .single()
}

export const addPrayerResponse = async (requestId, responseData) => {
  return await supabase
    .from('prayer_responses')
    .insert({
      prayer_request_id: requestId,
      ...responseData
    })
    .select()
    .single()
}

export const togglePrayerSupport = async (requestId, userId) => {
  // Check if user already supports this request
  const { data: existing } = await supabase
    .from('prayer_supporters')
    .select('id')
    .eq('prayer_request_id', requestId)
    .eq('user_id', userId)
    .single()

  if (existing) {
    // Remove support
    return await supabase
      .from('prayer_supporters')
      .delete()
      .eq('prayer_request_id', requestId)
      .eq('user_id', userId)
  } else {
    // Add support
    return await supabase
      .from('prayer_supporters')
      .insert({
        prayer_request_id: requestId,
        user_id: userId
      })
  }
}

// Coaching functions
export const getCoaches = async () => {
  return await supabase
    .from('user_profiles')
    .select(`
      *,
      session_count:coaching_sessions(count)
    `)
    .eq('role', 'coach')
    .eq('is_active', true)
}

export const getCoachingSessions = async (userId) => {
  return await supabase
    .from('coaching_sessions')
    .select(`
      *,
      coach:coach_profiles(
        full_name,
        specialization
      )
    `)
    .eq('user_id', userId)
    .order('session_datetime', { ascending: false })
}

export const createCoachingSession = async (sessionData) => {
  return await supabase
    .from('coaching_sessions')
    .insert(sessionData)
    .select()
    .single()
}

export const updateCoachingSession = async (sessionId, updates) => {
  return await supabase
    .from('coaching_sessions')
    .update(updates)
    .eq('id', sessionId)
}

export const getAvailableSlots = async (coachId, date) => {
  // This would typically integrate with a calendar service
  // For now, return mock available slots
  const slots = []
  for (let hour = 9; hour <= 17; hour++) {
    slots.push({
      time: `${hour.toString().padStart(2, '0')}:00`,
      display_time: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`
    })
  }
  return { data: slots, error: null }
}

// Notification functions
export const getNotifications = async (userId) => {
  return await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
}

export const markNotificationAsRead = async (notificationId) => {
  return await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId)
}

export const markAllNotificationsAsRead = async (userId) => {
  return await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('is_read', false)
}

export const deleteNotification = async (notificationId) => {
  return await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
}

export const getNotificationPreferences = async (userId) => {
  return await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()
}

export const updateNotificationPreferences = async (userId, preferences) => {
  return await supabase
    .from('notification_preferences')
    .upsert({
      user_id: userId,
      ...preferences
    })
}

// Admin functions
export const getAdminStats = async () => {
  // This would typically be a database function or view
  // For now, return mock stats
  return {
    data: {
      total_users: 1250,
      new_users_this_month: 89,
      active_enrollments: 456,
      new_enrollments_this_month: 67,
      monthly_revenue: 2340000, // in cents
      revenue_growth_percentage: 15,
      completion_rate: 78,
      completion_rate_change: 5
    },
    error: null
  }
}

export const getUsers = async () => {
  return await supabase
    .from('user_profiles')
    .select(`
      *,
      enrollment_count:enrollments(count)
    `)
    .order('created_at', { ascending: false })
}

export const updateUserRole = async (userId, role) => {
  return await supabase
    .from('user_profiles')
    .update({ role })
    .eq('user_id', userId)
}

export const toggleUserStatus = async (userId, isActive) => {
  return await supabase
    .from('user_profiles')
    .update({ is_active: isActive })
    .eq('user_id', userId)
}

export const getPayments = async () => {
  return await supabase
    .from('payments')
    .select(`
      *,
      user:user_profiles(full_name, email),
      enrollment:enrollments(
        program:programs(name)
      )
    `)
    .order('created_at', { ascending: false })
}

// Content management functions
export const getModuleContent = async (moduleId) => {
  return await supabase
    .from('program_modules')
    .select(`
      *,
      content:module_content(*)
    `)
    .eq('id', moduleId)
    .single()
}

export const updateModuleContent = async (moduleId, contentData) => {
  return await supabase
    .from('module_content')
    .upsert({
      module_id: moduleId,
      ...contentData
    })
}

// Testimonial functions
export const getTestimonials = async () => {
  return await supabase
    .from('testimonials')
    .select(`
      *,
      user:user_profiles(full_name)
    `)
    .eq('is_approved', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
}

export const createTestimonial = async (testimonialData) => {
  return await supabase
    .from('testimonials')
    .insert(testimonialData)
    .select()
    .single()
}

// Contact form functions
export const submitContactForm = async (formData) => {
  return await supabase
    .from('contact_submissions')
    .insert(formData)
    .select()
    .single()
}

// Newsletter functions
export const subscribeToNewsletter = async (email, preferences = {}) => {
  return await supabase
    .from('newsletter_subscriptions')
    .insert({
      email,
      ...preferences,
      subscribed_at: new Date().toISOString()
    })
    .select()
    .single()
}

export default supabase

