import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  Calendar, 
  Clock, 
  User,
  Video,
  Phone,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Filter,
  Search
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { 
  getCoachingSessions, 
  createCoachingSession, 
  updateCoachingSession,
  getCoaches,
  getAvailableSlots
} from '../../lib/supabase'

export function CoachingScheduler() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [coaches, setCoaches] = useState([])
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedCoach, setSelectedCoach] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [viewMode, setViewMode] = useState('calendar') // calendar, list
  const [filterStatus, setFilterStatus] = useState('all')
  
  const [bookingForm, setBookingForm] = useState({
    coach_id: '',
    session_date: '',
    session_time: '',
    duration_minutes: 60,
    session_type: 'video',
    topic: '',
    notes: '',
    goals: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedCoach && selectedDate) {
      fetchAvailableSlots()
    }
  }, [selectedCoach, selectedDate])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [sessionsData, coachesData] = await Promise.all([
        getCoachingSessions(user.id),
        getCoaches()
      ])

      setSessions(sessionsData.data || [])
      setCoaches(coachesData.data || [])
      
    } catch (error) {
      console.error('Error fetching coaching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableSlots = async () => {
    try {
      const { data, error } = await getAvailableSlots(
        selectedCoach.id, 
        selectedDate.toISOString().split('T')[0]
      )
      if (error) throw error
      setAvailableSlots(data || [])
    } catch (error) {
      console.error('Error fetching available slots:', error)
    }
  }

  const handleBookSession = async (e) => {
    e.preventDefault()
    try {
      const sessionDateTime = new Date(`${bookingForm.session_date}T${bookingForm.session_time}`)
      
      const { data, error } = await createCoachingSession({
        ...bookingForm,
        user_id: user.id,
        session_datetime: sessionDateTime.toISOString(),
        status: 'scheduled'
      })
      
      if (error) throw error
      
      setSessions([data, ...sessions])
      setBookingForm({
        coach_id: '',
        session_date: '',
        session_time: '',
        duration_minutes: 60,
        session_type: 'video',
        topic: '',
        notes: '',
        goals: ''
      })
      setShowBookingForm(false)
      
    } catch (error) {
      console.error('Error booking session:', error)
    }
  }

  const handleSessionUpdate = async (sessionId, updates) => {
    try {
      const { data, error } = await updateCoachingSession(sessionId, updates)
      if (error) throw error
      
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, ...updates } : s))
    } catch (error) {
      console.error('Error updating session:', error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      rescheduled: 'bg-yellow-100 text-yellow-800'
    }
    return colors[status] || colors.scheduled
  }

  const getSessionTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />
      case 'phone': return <Phone className="h-4 w-4" />
      case 'in_person': return <User className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const filteredSessions = sessions.filter(session => {
    if (filterStatus === 'all') return true
    return session.status === filterStatus
  })

  const upcomingSessions = sessions.filter(session => {
    const sessionDate = new Date(session.session_datetime)
    const now = new Date()
    return sessionDate > now && session.status !== 'cancelled'
  }).sort((a, b) => new Date(a.session_datetime) - new Date(b.session_datetime))

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coaching Sessions</h1>
          <p className="text-muted-foreground">
            Schedule and manage your one-on-one coaching sessions
          </p>
        </div>
        
        <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Book Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Book a Coaching Session</DialogTitle>
              <DialogDescription>
                Schedule a one-on-one session with one of our certified coaches
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleBookSession} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Coach</label>
                <select
                  value={bookingForm.coach_id}
                  onChange={(e) => {
                    const coachId = e.target.value
                    setBookingForm(prev => ({ ...prev, coach_id: coachId }))
                    setSelectedCoach(coaches.find(c => c.id === coachId))
                  }}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Choose a coach...</option>
                  {coaches.map(coach => (
                    <option key={coach.id} value={coach.id}>
                      {coach.full_name} - {coach.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={bookingForm.session_date}
                    onChange={(e) => {
                      setBookingForm(prev => ({ ...prev, session_date: e.target.value }))
                      setSelectedDate(new Date(e.target.value))
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Time</label>
                  <select
                    value={bookingForm.session_time}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, session_time: e.target.value }))}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select time...</option>
                    {availableSlots.map(slot => (
                      <option key={slot.time} value={slot.time}>
                        {slot.display_time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Duration</label>
                  <select
                    value={bookingForm.duration_minutes}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Session Type</label>
                  <select
                    value={bookingForm.session_type}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, session_type: e.target.value }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="video">Video Call</option>
                    <option value="phone">Phone Call</option>
                    <option value="in_person">In Person</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Session Topic</label>
                <Input
                  value={bookingForm.topic}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="What would you like to focus on?"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Goals for this Session</label>
                <Textarea
                  value={bookingForm.goals}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, goals: e.target.value }))}
                  placeholder="What do you hope to achieve in this session?"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Additional Notes</label>
                <Textarea
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional information for your coach..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowBookingForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Book Session
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{upcomingSessions.length}</div>
            <div className="text-sm text-muted-foreground">Upcoming Sessions</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {sessions.filter(s => s.status === 'completed').length}
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {sessions.reduce((total, s) => total + (s.duration_minutes || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Minutes</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <User className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{coaches.length}</div>
            <div className="text-sm text-muted-foreground">Available Coaches</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={viewMode} onValueChange={setViewMode} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="coaches">Coaches</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="all">All Sessions</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-6">
          {/* Upcoming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>Your next scheduled coaching sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No upcoming sessions</h3>
                  <p className="text-muted-foreground mb-4">
                    Book your first coaching session to get started
                  </p>
                  <Button onClick={() => setShowBookingForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Book Session
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          {getSessionTypeIcon(session.session_type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{session.topic}</h4>
                          <p className="text-sm text-muted-foreground">
                            with {session.coach_name}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span>{formatDate(session.session_datetime)}</span>
                            <span>{formatTime(session.session_datetime)}</span>
                            <span>{session.duration_minutes} min</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(session.status)}>
                          {session.status}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          {session.meeting_link && (
                            <Button size="sm">
                              Join Session
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4">Session</th>
                      <th className="text-left p-4">Coach</th>
                      <th className="text-left p-4">Date & Time</th>
                      <th className="text-left p-4">Type</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.map((session) => (
                      <tr key={session.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{session.topic}</p>
                            <p className="text-sm text-muted-foreground">
                              {session.duration_minutes} minutes
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{session.coach_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {session.coach_specialization}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{formatDate(session.session_datetime)}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatTime(session.session_datetime)}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {getSessionTypeIcon(session.session_type)}
                            <span className="capitalize">{session.session_type.replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(session.status)}>
                            {session.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            {session.status === 'scheduled' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleSessionUpdate(session.id, { status: 'cancelled' })}
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coaches Tab */}
        <TabsContent value="coaches" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coaches.map((coach) => (
              <Card key={coach.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg">{coach.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{coach.specialization}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{coach.experience_years}+ years</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>{coach.session_count || 0} sessions</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-3 h-3 rounded-full ${
                              i < (coach.rating || 5) ? 'bg-yellow-400' : 'bg-gray-200'
                            }`} 
                          />
                        ))}
                        <span className="text-sm text-muted-foreground ml-2">
                          ({coach.rating || 5.0})
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {coach.bio || 'Experienced coach specializing in faith-based leadership development.'}
                    </p>
                    
                    <Button 
                      className="w-full"
                      onClick={() => {
                        setSelectedCoach(coach)
                        setBookingForm(prev => ({ ...prev, coach_id: coach.id }))
                        setShowBookingForm(true)
                      }}
                    >
                      Book Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CoachingScheduler

