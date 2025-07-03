import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  Heart, 
  MessageCircle, 
  Plus,
  Clock,
  Users,
  Praying,
  Send,
  Filter,
  Search
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getPrayerRequests, createPrayerRequest, addPrayerResponse, togglePrayerSupport } from '../../lib/supabase'

export function PrayerWall() {
  const { user } = useAuth()
  const [prayerRequests, setPrayerRequests] = useState([])
  const [filteredRequests, setFilteredRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: 'general',
    is_anonymous: false
  })
  const [responseText, setResponseText] = useState({})

  useEffect(() => {
    fetchPrayerRequests()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [prayerRequests, searchTerm, filterCategory])

  const fetchPrayerRequests = async () => {
    try {
      const { data, error } = await getPrayerRequests()
      if (error) throw error
      setPrayerRequests(data || [])
    } catch (error) {
      console.error('Error fetching prayer requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterRequests = () => {
    let filtered = prayerRequests

    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(request => request.category === filterCategory)
    }

    setFilteredRequests(filtered)
  }

  const handleCreateRequest = async (e) => {
    e.preventDefault()
    try {
      const { data, error } = await createPrayerRequest({
        ...newRequest,
        user_id: user.id
      })
      if (error) throw error
      
      setPrayerRequests([data, ...prayerRequests])
      setNewRequest({ title: '', description: '', category: 'general', is_anonymous: false })
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating prayer request:', error)
    }
  }

  const handleAddResponse = async (requestId) => {
    const text = responseText[requestId]
    if (!text?.trim()) return

    try {
      const { data, error } = await addPrayerResponse(requestId, {
        response_text: text,
        user_id: user.id
      })
      if (error) throw error

      // Update the prayer request with new response
      setPrayerRequests(prev => prev.map(request => 
        request.id === requestId 
          ? { ...request, responses: [...(request.responses || []), data] }
          : request
      ))
      
      setResponseText(prev => ({ ...prev, [requestId]: '' }))
    } catch (error) {
      console.error('Error adding response:', error)
    }
  }

  const handleToggleSupport = async (requestId) => {
    try {
      const { error } = await togglePrayerSupport(requestId, user.id)
      if (error) throw error

      // Update the UI optimistically
      setPrayerRequests(prev => prev.map(request => {
        if (request.id === requestId) {
          const isCurrentlySupporting = request.supporters?.some(s => s.user_id === user.id)
          const newSupporters = isCurrentlySupporting
            ? request.supporters.filter(s => s.user_id !== user.id)
            : [...(request.supporters || []), { user_id: user.id, user_name: user.full_name }]
          
          return { ...request, supporters: newSupporters }
        }
        return request
      }))
    } catch (error) {
      console.error('Error toggling support:', error)
    }
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return `${Math.floor(diffInHours / 168)}w ago`
  }

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      health: 'bg-red-100 text-red-800',
      family: 'bg-green-100 text-green-800',
      work: 'bg-purple-100 text-purple-800',
      ministry: 'bg-yellow-100 text-yellow-800',
      guidance: 'bg-indigo-100 text-indigo-800'
    }
    return colors[category] || colors.general
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
          <h1 className="text-3xl font-bold">Prayer Wall</h1>
          <p className="text-muted-foreground">
            Share your prayer requests and support others in their journey
          </p>
        </div>
        
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Share Prayer Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share a Prayer Request</DialogTitle>
              <DialogDescription>
                Let the community know how they can pray for you
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newRequest.title}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief description of your prayer request"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Share more details about how we can pray for you..."
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  value={newRequest.category}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="general">General</option>
                  <option value="health">Health</option>
                  <option value="family">Family</option>
                  <option value="work">Work/Career</option>
                  <option value="ministry">Ministry</option>
                  <option value="guidance">Guidance</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={newRequest.is_anonymous}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, is_anonymous: e.target.checked }))}
                />
                <label htmlFor="anonymous" className="text-sm">
                  Post anonymously
                </label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Share Request
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search prayer requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="all">All Categories</option>
          <option value="general">General</option>
          <option value="health">Health</option>
          <option value="family">Family</option>
          <option value="work">Work/Career</option>
          <option value="ministry">Ministry</option>
          <option value="guidance">Guidance</option>
        </select>
      </div>

      {/* Prayer Requests */}
      <div className="space-y-6">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge className={getCategoryColor(request.category)}>
                      {request.category}
                    </Badge>
                    {request.is_urgent && (
                      <Badge variant="destructive">Urgent</Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{request.title}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>
                      by {request.is_anonymous ? 'Anonymous' : request.author_name}
                    </span>
                    <span>{formatTimeAgo(request.created_at)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-primary">
                      {request.supporters?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">praying</div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{request.description}</p>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                <Button
                  variant={request.supporters?.some(s => s.user_id === user.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggleSupport(request.id)}
                >
                  <Heart className={`h-4 w-4 mr-2 ${
                    request.supporters?.some(s => s.user_id === user.id) ? 'fill-current' : ''
                  }`} />
                  {request.supporters?.some(s => s.user_id === user.id) ? 'Praying' : 'Pray for this'}
                </Button>
                
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  <span>{request.responses?.length || 0} responses</span>
                </div>
              </div>

              {/* Supporters */}
              {request.supporters && request.supporters.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Praying className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {request.supporters.slice(0, 3).map(s => s.user_name).join(', ')}
                    {request.supporters.length > 3 && ` and ${request.supporters.length - 3} others`}
                    {' '}are praying for this
                  </span>
                </div>
              )}

              {/* Responses */}
              {request.responses && request.responses.length > 0 && (
                <div className="space-y-3 border-t pt-4">
                  <h4 className="font-medium text-sm">Responses & Encouragement</h4>
                  {request.responses.slice(0, 3).map((response) => (
                    <div key={response.id} className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{response.author_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(response.created_at)}
                        </span>
                      </div>
                      <p className="text-sm">{response.response_text}</p>
                    </div>
                  ))}
                  
                  {request.responses.length > 3 && (
                    <Button variant="ghost" size="sm">
                      View all {request.responses.length} responses
                    </Button>
                  )}
                </div>
              )}

              {/* Add Response */}
              <div className="border-t pt-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Share encouragement or let them know you're praying..."
                    value={responseText[request.id] || ''}
                    onChange={(e) => setResponseText(prev => ({ 
                      ...prev, 
                      [request.id]: e.target.value 
                    }))}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleAddResponse(request.id)
                      }
                    }}
                  />
                  <Button 
                    size="sm"
                    onClick={() => handleAddResponse(request.id)}
                    disabled={!responseText[request.id]?.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <Praying className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No prayer requests found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Be the first to share a prayer request with the community'
            }
          </p>
          {!searchTerm && filterCategory === 'all' && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Share Prayer Request
            </Button>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Praying className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{prayerRequests.length}</div>
            <div className="text-sm text-muted-foreground">Prayer Requests</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {prayerRequests.reduce((sum, r) => sum + (r.supporters?.length || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">People Praying</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {prayerRequests.reduce((sum, r) => sum + (r.responses?.length || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Responses Shared</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PrayerWall

