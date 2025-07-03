import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Alert, AlertDescription } from '../components/ui/alert'
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  Calendar,
  Users,
  MessageSquare,
  Heart,
  Play,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getUserEnrollments, getUserProgress, getForumPosts, getPrayerRequests } from '../lib/supabase'

export function Dashboard() {
  const { user, profile } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [communityPosts, setCommunityPosts] = useState([])
  const [prayerRequests, setPrayerRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch user enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await getUserEnrollments(user.id)
      if (enrollmentsError) throw enrollmentsError
      setEnrollments(enrollmentsData || [])

      // Fetch recent community posts
      const { data: postsData, error: postsError } = await getForumPosts(null, 5)
      if (postsError) throw postsError
      setCommunityPosts(postsData || [])

      // Fetch recent prayer requests
      const { data: prayersData, error: prayersError } = await getPrayerRequests(5)
      if (prayersError) throw prayersError
      setPrayerRequests(prayersData || [])

    } catch (err) {
      setError('Failed to load dashboard data')
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

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
    <div className="container mx-auto py-8 space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name || 'Leader'}!</h1>
          <p className="text-muted-foreground mt-2">
            Continue your faith-based leadership journey
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/programs">
            <Button>
              <BookOpen className="mr-2 h-4 w-4" />
              Explore Programs
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrollments.filter(e => e.progress_percentage < 100).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Programs in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrollments.filter(e => e.progress_percentage === 100).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Programs completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24h</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="learning" className="space-y-6">
        <TabsList>
          <TabsTrigger value="learning">My Learning</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="prayer">Prayer</TabsTrigger>
          <TabsTrigger value="coaching">Coaching</TabsTrigger>
        </TabsList>

        {/* Learning Tab */}
        <TabsContent value="learning" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Programs */}
            <Card>
              <CardHeader>
                <CardTitle>Current Programs</CardTitle>
                <CardDescription>
                  Your active learning programs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {enrollments.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No programs yet</h3>
                    <p className="text-muted-foreground">
                      Start your leadership journey today
                    </p>
                    <Link to="/programs" className="mt-4 inline-block">
                      <Button>Browse Programs</Button>
                    </Link>
                  </div>
                ) : (
                  enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{enrollment.program.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {enrollment.program.duration_weeks} weeks
                          </p>
                        </div>
                        {getStatusBadge(
                          enrollment.progress_percentage === 100 ? 'completed' : 'in_progress'
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{enrollment.progress_percentage}%</span>
                        </div>
                        <Progress 
                          value={enrollment.progress_percentage} 
                          className="h-2"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Link to={`/programs/${enrollment.program.slug}/learn`}>
                          <Button size="sm" variant="outline">
                            <Play className="mr-2 h-4 w-4" />
                            Continue
                          </Button>
                        </Link>
                        <Link to={`/programs/${enrollment.program.slug}`}>
                          <Button size="sm" variant="ghost">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest learning milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Completed Module: Servant Leadership</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Started: Character & Integrity</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">Earned: Foundation Certificate</p>
                      <p className="text-xs text-muted-foreground">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Community Tab */}
        <TabsContent value="community" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Community Discussions</CardTitle>
              <CardDescription>
                Recent conversations from the leadership community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {communityPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No recent discussions</h3>
                    <p className="text-muted-foreground">
                      Be the first to start a conversation
                    </p>
                    <Link to="/community" className="mt-4 inline-block">
                      <Button>Join Community</Button>
                    </Link>
                  </div>
                ) : (
                  communityPosts.map((post) => (
                    <div key={post.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <MessageSquare className="h-5 w-5 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <h4 className="font-medium">{post.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {post.content}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                            <span>by {post.user?.full_name}</span>
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            <span>{post.reply_count} replies</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-6">
                <Link to="/community">
                  <Button variant="outline" className="w-full">
                    View All Discussions
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prayer Tab */}
        <TabsContent value="prayer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prayer Requests</CardTitle>
              <CardDescription>
                Lift each other up in prayer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prayerRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No prayer requests</h3>
                    <p className="text-muted-foreground">
                      Share your prayer needs with the community
                    </p>
                    <Link to="/prayer" className="mt-4 inline-block">
                      <Button>Share Request</Button>
                    </Link>
                  </div>
                ) : (
                  prayerRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <h4 className="font-medium">{request.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {request.request_text}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>by {request.user?.full_name}</span>
                          <span>•</span>
                          <span>{request.prayer_count} praying</span>
                        </div>
                        <Button size="sm" variant="outline">
                          <Heart className="mr-2 h-4 w-4" />
                          Pray
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-6">
                <Link to="/prayer">
                  <Button variant="outline" className="w-full">
                    View All Prayer Requests
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coaching Tab */}
        <TabsContent value="coaching" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Coaching Sessions</CardTitle>
              <CardDescription>
                Your upcoming and past coaching sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No coaching sessions</h3>
                <p className="text-muted-foreground">
                  Book a session with one of our certified coaches
                </p>
                <Link to="/coaching" className="mt-4 inline-block">
                  <Button>Book Session</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Dashboard

