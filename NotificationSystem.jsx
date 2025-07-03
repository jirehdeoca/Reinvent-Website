import React, { useState, useEffect, createContext, useContext } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { 
  Bell, 
  BellRing,
  Check,
  X,
  Mail,
  MessageSquare,
  Calendar,
  BookOpen,
  Award,
  Heart,
  Users,
  Settings,
  Trash2,
  MarkAsRead,
  Filter
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  updateNotificationPreferences,
  getNotificationPreferences
} from '../../lib/supabase'

// Notification Context
const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Notification Provider Component
export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [preferences, setPreferences] = useState({})

  useEffect(() => {
    if (user) {
      fetchNotifications()
      fetchPreferences()
      
      // Set up real-time subscription for notifications
      const interval = setInterval(fetchNotifications, 30000) // Poll every 30 seconds
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      const { data, error } = await getNotifications(user.id)
      if (error) throw error
      
      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.is_read).length || 0)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const fetchPreferences = async () => {
    try {
      const { data, error } = await getNotificationPreferences(user.id)
      if (error) throw error
      setPreferences(data || {})
    } catch (error) {
      console.error('Error fetching notification preferences:', error)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(user.id)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotificationById = async (notificationId) => {
    try {
      await deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      const notification = notifications.find(n => n.id === notificationId)
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const value = {
    notifications,
    unreadCount,
    preferences,
    markAsRead,
    markAllAsRead,
    deleteNotification: deleteNotificationById,
    fetchNotifications,
    setPreferences
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

// Notification Bell Component
export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const [showDropdown, setShowDropdown] = useState(false)
  const [filter, setFilter] = useState('all') // all, unread, read

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'course_progress': return <BookOpen className="h-4 w-4" />
      case 'coaching_session': return <Calendar className="h-4 w-4" />
      case 'forum_reply': return <MessageSquare className="h-4 w-4" />
      case 'prayer_response': return <Heart className="h-4 w-4" />
      case 'achievement': return <Award className="h-4 w-4" />
      case 'community': return <Users className="h-4 w-4" />
      case 'system': return <Settings className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type) => {
    const colors = {
      course_progress: 'text-blue-600',
      coaching_session: 'text-green-600',
      forum_reply: 'text-purple-600',
      prayer_response: 'text-pink-600',
      achievement: 'text-yellow-600',
      community: 'text-indigo-600',
      system: 'text-gray-600'
    }
    return colors[type] || 'text-gray-600'
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read
    if (filter === 'read') return notification.is_read
    return true
  })

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative"
      >
        {unreadCount > 0 ? (
          <BellRing className="h-5 w-5" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex space-x-2">
                <Button size="sm" variant="ghost" onClick={markAllAsRead}>
                  <MarkAsRead className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setShowDropdown(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="flex space-x-1">
              <Button 
                size="sm" 
                variant={filter === 'all' ? 'default' : 'ghost'}
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button 
                size="sm" 
                variant={filter === 'unread' ? 'default' : 'ghost'}
                onClick={() => setFilter('unread')}
              >
                Unread ({unreadCount})
              </Button>
              <Button 
                size="sm" 
                variant={filter === 'read' ? 'default' : 'ghost'}
                onClick={() => setFilter('read')}
              >
                Read
              </Button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 cursor-pointer ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.is_read ? 'font-medium' : ''}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                          <div className="flex space-x-1">
                            {!notification.is_read && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markAsRead(notification.id)
                                }}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t text-center">
              <Button 
                size="sm" 
                variant="ghost" 
                className="w-full"
                onClick={() => setShowDropdown(false)}
              >
                View All Notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Notification Settings Component
export function NotificationSettings() {
  const { user } = useAuth()
  const { preferences, setPreferences } = useNotifications()
  const [localPreferences, setLocalPreferences] = useState({
    email_notifications: true,
    push_notifications: true,
    course_progress: true,
    coaching_reminders: true,
    forum_replies: true,
    prayer_responses: true,
    community_updates: true,
    marketing_emails: false,
    weekly_digest: true,
    ...preferences
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    try {
      setSaving(true)
      await updateNotificationPreferences(user.id, localPreferences)
      setPreferences(localPreferences)
    } catch (error) {
      console.error('Error saving notification preferences:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = (key) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how you'd like to be notified about important updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* General Settings */}
        <div>
          <h4 className="font-medium mb-3">General Notifications</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <input
                type="checkbox"
                checked={localPreferences.email_notifications}
                onChange={() => handleToggle('email_notifications')}
                className="h-4 w-4"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive browser push notifications
                </p>
              </div>
              <input
                type="checkbox"
                checked={localPreferences.push_notifications}
                onChange={() => handleToggle('push_notifications')}
                className="h-4 w-4"
              />
            </div>
          </div>
        </div>

        {/* Course & Learning */}
        <div>
          <h4 className="font-medium mb-3">Course & Learning</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Course Progress</p>
                <p className="text-sm text-muted-foreground">
                  Updates on module completion and achievements
                </p>
              </div>
              <input
                type="checkbox"
                checked={localPreferences.course_progress}
                onChange={() => handleToggle('course_progress')}
                className="h-4 w-4"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Coaching Reminders</p>
                <p className="text-sm text-muted-foreground">
                  Reminders for upcoming coaching sessions
                </p>
              </div>
              <input
                type="checkbox"
                checked={localPreferences.coaching_reminders}
                onChange={() => handleToggle('coaching_reminders')}
                className="h-4 w-4"
              />
            </div>
          </div>
        </div>

        {/* Community */}
        <div>
          <h4 className="font-medium mb-3">Community</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Forum Replies</p>
                <p className="text-sm text-muted-foreground">
                  When someone replies to your forum posts
                </p>
              </div>
              <input
                type="checkbox"
                checked={localPreferences.forum_replies}
                onChange={() => handleToggle('forum_replies')}
                className="h-4 w-4"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Prayer Responses</p>
                <p className="text-sm text-muted-foreground">
                  When someone responds to your prayer requests
                </p>
              </div>
              <input
                type="checkbox"
                checked={localPreferences.prayer_responses}
                onChange={() => handleToggle('prayer_responses')}
                className="h-4 w-4"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Community Updates</p>
                <p className="text-sm text-muted-foreground">
                  New features and community announcements
                </p>
              </div>
              <input
                type="checkbox"
                checked={localPreferences.community_updates}
                onChange={() => handleToggle('community_updates')}
                className="h-4 w-4"
              />
            </div>
          </div>
        </div>

        {/* Marketing & Digest */}
        <div>
          <h4 className="font-medium mb-3">Marketing & Digest</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Marketing Emails</p>
                <p className="text-sm text-muted-foreground">
                  Promotional content and special offers
                </p>
              </div>
              <input
                type="checkbox"
                checked={localPreferences.marketing_emails}
                onChange={() => handleToggle('marketing_emails')}
                className="h-4 w-4"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekly Digest</p>
                <p className="text-sm text-muted-foreground">
                  Weekly summary of your progress and community activity
                </p>
              </div>
              <input
                type="checkbox"
                checked={localPreferences.weekly_digest}
                onChange={() => handleToggle('weekly_digest')}
                className="h-4 w-4"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// In-App Notification Toast Component
export function NotificationToast({ notification, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000) // Auto-close after 5 seconds
    return () => clearTimeout(timer)
  }, [onClose])

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'course_progress': return <BookOpen className="h-5 w-5" />
      case 'coaching_session': return <Calendar className="h-5 w-5" />
      case 'forum_reply': return <MessageSquare className="h-5 w-5" />
      case 'prayer_response': return <Heart className="h-5 w-5" />
      case 'achievement': return <Award className="h-5 w-5" />
      case 'community': return <Users className="h-5 w-5" />
      default: return <Bell className="h-5 w-5" />
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-80 bg-white border rounded-lg shadow-lg p-4 animate-in slide-in-from-right">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 text-primary">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-sm">{notification.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">
            {notification.message}
          </p>
        </div>
        <Button size="sm" variant="ghost" onClick={onClose}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

export default NotificationSystem

