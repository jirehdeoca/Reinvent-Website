import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  MessageSquare, 
  Users, 
  Clock, 
  Search,
  Plus,
  Pin,
  TrendingUp,
  Heart,
  Reply,
  Eye
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getForums, getForumPosts, createForum } from '../../lib/supabase'

export function ForumList() {
  const { user } = useAuth()
  const [forums, setForums] = useState([])
  const [recentPosts, setRecentPosts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    fetchForums()
    fetchRecentPosts()
  }, [])

  const fetchForums = async () => {
    try {
      const { data, error } = await getForums()
      if (error) throw error
      setForums(data || [])
    } catch (error) {
      console.error('Error fetching forums:', error)
    }
  }

  const fetchRecentPosts = async () => {
    try {
      const { data, error } = await getForumPosts(null, 10) // Get recent posts across all forums
      if (error) throw error
      setRecentPosts(data || [])
    } catch (error) {
      console.error('Error fetching recent posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredForums = forums.filter(forum =>
    forum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    forum.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return `${Math.floor(diffInHours / 168)}w ago`
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
          <h1 className="text-3xl font-bold">Community Forums</h1>
          <p className="text-muted-foreground">
            Connect with fellow leaders and share your journey
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Discussion
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search forums and discussions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="forums" className="space-y-6">
        <TabsList>
          <TabsTrigger value="forums">All Forums</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        {/* Forums Tab */}
        <TabsContent value="forums" className="space-y-4">
          <div className="grid gap-4">
            {filteredForums.map((forum) => (
              <Card key={forum.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Link 
                          to={`/community/forum/${forum.id}`}
                          className="text-xl font-semibold hover:text-primary transition-colors"
                        >
                          {forum.name}
                        </Link>
                        {forum.is_pinned && (
                          <Pin className="h-4 w-4 text-primary" />
                        )}
                        <Badge variant={forum.category === 'general' ? 'default' : 'secondary'}>
                          {forum.category}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">
                        {forum.description}
                      </p>
                      
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{forum.post_count || 0} posts</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{forum.member_count || 0} members</span>
                        </div>
                        {forum.last_post_at && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Last post {formatTimeAgo(forum.last_post_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {forum.last_post && (
                      <div className="text-right text-sm">
                        <p className="font-medium">{forum.last_post.title}</p>
                        <p className="text-muted-foreground">
                          by {forum.last_post.author_name}
                        </p>
                        <p className="text-muted-foreground">
                          {formatTimeAgo(forum.last_post.created_at)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4">
            {recentPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Link 
                          to={`/community/forum/${post.forum_id}/post/${post.id}`}
                          className="font-semibold hover:text-primary transition-colors"
                        >
                          {post.title}
                        </Link>
                        <Badge variant="outline" className="text-xs">
                          {post.forum_name}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                        {post.content}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>by {post.author_name}</span>
                        <span>{formatTimeAgo(post.created_at)}</span>
                        <div className="flex items-center space-x-1">
                          <Reply className="h-3 w-3" />
                          <span>{post.reply_count || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-3 w-3" />
                          <span>{post.like_count || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{post.view_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trending Tab */}
        <TabsContent value="trending" className="space-y-4">
          <div className="grid gap-4">
            {recentPosts
              .filter(post => (post.like_count || 0) > 0 || (post.reply_count || 0) > 2)
              .sort((a, b) => ((b.like_count || 0) + (b.reply_count || 0)) - ((a.like_count || 0) + (a.reply_count || 0)))
              .map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-orange-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Link 
                            to={`/community/forum/${post.forum_id}/post/${post.id}`}
                            className="font-semibold hover:text-primary transition-colors"
                          >
                            {post.title}
                          </Link>
                          <Badge variant="outline" className="text-xs">
                            {post.forum_name}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            🔥 Trending
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                          {post.content}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>by {post.author_name}</span>
                          <span>{formatTimeAgo(post.created_at)}</span>
                          <div className="flex items-center space-x-1">
                            <Reply className="h-3 w-3" />
                            <span>{post.reply_count || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="h-3 w-3" />
                            <span>{post.like_count || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{post.view_count || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{forums.reduce((sum, f) => sum + (f.post_count || 0), 0)}</div>
            <div className="text-sm text-muted-foreground">Total Posts</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{forums.reduce((sum, f) => sum + (f.member_count || 0), 0)}</div>
            <div className="text-sm text-muted-foreground">Active Members</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{forums.length}</div>
            <div className="text-sm text-muted-foreground">Forums</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {recentPosts.filter(p => {
                const postDate = new Date(p.created_at)
                const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
                return postDate > dayAgo
              }).length}
            </div>
            <div className="text-sm text-muted-foreground">Posts Today</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ForumList

