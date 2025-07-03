import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Alert, AlertDescription } from '../components/ui/alert'
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp,
  UserPlus,
  GraduationCap,
  MessageSquare,
  Settings,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Calendar
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { 
  getAdminStats, 
  getUsers, 
  getEnrollments, 
  getPrograms,
  updateUserRole,
  toggleUserStatus,
  getPayments,
  getForumPosts,
  getPrayerRequests
} from '../lib/supabase'

export function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({})
  const [users, setUsers] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [programs, setPrograms] = useState([])
  const [payments, setPayments] = useState([])
  const [forumPosts, setForumPosts] = useState([])
  const [prayerRequests, setPrayerRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('overview')

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData()
    }
  }, [user])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      
      // Fetch all admin data in parallel
      const [
        statsData,
        usersData,
        enrollmentsData,
        programsData,
        paymentsData,
        forumData,
        prayerData
      ] = await Promise.all([
        getAdminStats(),
        getUsers(),
        getEnrollments(),
        getPrograms(),
        getPayments(),
        getForumPosts(),
        getPrayerRequests()
      ])

      setStats(statsData.data || {})
      setUsers(usersData.data || [])
      setEnrollments(enrollmentsData.data || [])
      setPrograms(programsData.data || [])
      setPayments(paymentsData.data || [])
      setForumPosts(forumData.data || [])
      setPrayerRequests(prayerData.data || [])
      
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserRoleUpdate = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const handleUserStatusToggle = async (userId, isActive) => {
    try {
      await toggleUserStatus(userId, isActive)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: isActive } : u))
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100) // Assuming amount is in cents
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>
            You don't have permission to access the admin dashboard.
          </AlertDescription>
        </Alert>
      </div>
    )
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
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, content, and platform analytics
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-3xl font-bold">{stats.total_users || 0}</p>
                    <p className="text-sm text-green-600">
                      +{stats.new_users_this_month || 0} this month
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Enrollments</p>
                    <p className="text-3xl font-bold">{stats.active_enrollments || 0}</p>
                    <p className="text-sm text-green-600">
                      +{stats.new_enrollments_this_month || 0} this month
                    </p>
                  </div>
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                    <p className="text-3xl font-bold">
                      {formatCurrency(stats.monthly_revenue || 0)}
                    </p>
                    <p className="text-sm text-green-600">
                      +{stats.revenue_growth_percentage || 0}% vs last month
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                    <p className="text-3xl font-bold">{stats.completion_rate || 0}%</p>
                    <p className="text-sm text-green-600">
                      +{stats.completion_rate_change || 0}% vs last month
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Enrollments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enrollments.slice(0, 5).map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{enrollment.user_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {enrollment.program_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(enrollment.amount_paid)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(enrollment.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Forum Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forumPosts.slice(0, 5).map((post) => (
                    <div key={post.id} className="flex items-start space-x-3">
                      <MessageSquare className="h-4 w-4 text-primary mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{post.title}</p>
                        <p className="text-xs text-muted-foreground">
                          by {post.author_name} • {formatDate(post.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4">User</th>
                      <th className="text-left p-4">Role</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Enrollments</th>
                      <th className="text-left p-4">Joined</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter(user => 
                        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((user) => (
                        <tr key={user.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{user.full_name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <select
                              value={user.role}
                              onChange={(e) => handleUserRoleUpdate(user.id, e.target.value)}
                              className="text-sm border rounded px-2 py-1"
                            >
                              <option value="student">Student</option>
                              <option value="coach">Coach</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <Badge variant={user.is_active ? "default" : "secondary"}>
                              {user.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <span className="text-sm">{user.enrollment_count || 0}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm">{formatDate(user.created_at)}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleUserStatusToggle(user.id, !user.is_active)}
                              >
                                {user.is_active ? (
                                  <XCircle className="h-3 w-3" />
                                ) : (
                                  <CheckCircle className="h-3 w-3" />
                                )}
                              </Button>
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

        {/* Enrollments Tab */}
        <TabsContent value="enrollments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Management</CardTitle>
              <CardDescription>
                View and manage all program enrollments
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4">Student</th>
                      <th className="text-left p-4">Program</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Progress</th>
                      <th className="text-left p-4">Amount</th>
                      <th className="text-left p-4">Enrolled</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((enrollment) => (
                      <tr key={enrollment.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{enrollment.user_name}</p>
                            <p className="text-sm text-muted-foreground">{enrollment.user_email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-medium">{enrollment.program_name}</p>
                        </td>
                        <td className="p-4">
                          <Badge variant={
                            enrollment.status === 'active' ? 'default' :
                            enrollment.status === 'completed' ? 'secondary' :
                            'outline'
                          }>
                            {enrollment.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${enrollment.progress_percentage || 0}%` }}
                              />
                            </div>
                            <span className="text-sm">{enrollment.progress_percentage || 0}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-medium">
                            {formatCurrency(enrollment.amount_paid)}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm">{formatDate(enrollment.created_at)}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Mail className="h-3 w-3" />
                            </Button>
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

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Programs</CardTitle>
                <CardDescription>Manage training programs and curricula</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {programs.map((program) => (
                    <div key={program.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{program.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {program.module_count} modules • {program.enrollment_count} enrolled
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Program
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Library</CardTitle>
                <CardDescription>Manage videos, documents, and resources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded">
                      <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="font-medium">Documents</p>
                      <p className="text-sm text-muted-foreground">245 files</p>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="font-medium">Videos</p>
                      <p className="text-sm text-muted-foreground">89 files</p>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Community Tab */}
        <TabsContent value="community" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Forum Activity</CardTitle>
                <CardDescription>Recent discussions and posts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forumPosts.slice(0, 8).map((post) => (
                    <div key={post.id} className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{post.title}</p>
                        <p className="text-xs text-muted-foreground">
                          by {post.author_name} • {formatDate(post.created_at)}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prayer Requests</CardTitle>
                <CardDescription>Community prayer wall activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prayerRequests.slice(0, 8).map((request) => (
                    <div key={request.id} className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{request.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.supporters?.length || 0} praying • {formatDate(request.created_at)}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {request.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{formatCurrency(stats.total_revenue || 0)}</p>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-xl font-semibold">{formatCurrency(stats.monthly_revenue || 0)}</p>
                      <p className="text-xs text-muted-foreground">This Month</p>
                    </div>
                    <div>
                      <p className="text-xl font-semibold">{formatCurrency(stats.average_order_value || 0)}</p>
                      <p className="text-xs text-muted-foreground">Avg Order</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Course Completion Rate</span>
                    <span className="font-medium">{stats.completion_rate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Average Session Duration</span>
                    <span className="font-medium">{stats.avg_session_duration || 0} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Forum Engagement</span>
                    <span className="font-medium">{stats.forum_engagement_rate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Prayer Wall Activity</span>
                    <span className="font-medium">{stats.prayer_wall_activity || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminDashboard

