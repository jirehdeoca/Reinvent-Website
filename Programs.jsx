import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  CheckCircle,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react'
import { getPrograms } from '../lib/supabase'

export function Programs() {
  const [programs, setPrograms] = useState([])
  const [filteredPrograms, setFilteredPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  useEffect(() => {
    fetchPrograms()
  }, [])

  useEffect(() => {
    filterAndSortPrograms()
  }, [programs, searchTerm, filterType, sortBy])

  const fetchPrograms = async () => {
    try {
      const { data, error } = await getPrograms()
      if (error) throw error
      setPrograms(data || [])
    } catch (error) {
      console.error('Error fetching programs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortPrograms = () => {
    let filtered = programs

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(program =>
        program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(program => program.program_type === filterType)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'price':
          return a.price - b.price
        case 'duration':
          return a.duration_weeks - b.duration_weeks
        default:
          return 0
      }
    })

    setFilteredPrograms(filtered)
  }

  const getProgramTypeColor = (type) => {
    switch (type) {
      case 'foundation':
        return 'bg-blue-100 text-blue-800'
      case 'advanced':
        return 'bg-purple-100 text-purple-800'
      case 'certification':
        return 'bg-green-100 text-green-800'
      case 'workshop':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Leadership Training Programs</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Comprehensive programs designed to integrate biblical principles with professional excellence. 
          Choose the path that aligns with your leadership journey.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              <SelectItem value="foundation">Foundation</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="certification">Certification</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="duration">Duration</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.map((program) => (
          <Card key={program.id} className="h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge className={getProgramTypeColor(program.program_type)}>
                  {program.program_type}
                </Badge>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-muted-foreground">4.9</span>
                </div>
              </div>
              <CardTitle className="text-xl">{program.name}</CardTitle>
              <CardDescription className="line-clamp-3">
                {program.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                {/* Program Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{program.duration_weeks} weeks</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{program.modules?.length || 12} modules</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>2,500+ enrolled</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Certificate</span>
                  </div>
                </div>

                {/* Learning Outcomes Preview */}
                <div>
                  <h4 className="font-medium mb-2">Key Outcomes</h4>
                  <div className="space-y-1">
                    {program.learning_outcomes?.slice(0, 3).map((outcome, index) => (
                      <div key={index} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                        <span className="line-clamp-1">{outcome}</span>
                      </div>
                    ))}
                    {program.learning_outcomes?.length > 3 && (
                      <div className="text-sm text-muted-foreground">
                        +{program.learning_outcomes.length - 3} more outcomes
                      </div>
                    )}
                  </div>
                </div>

                {/* Biblical Foundation */}
                <div>
                  <h4 className="font-medium mb-1">Biblical Foundation</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {program.biblical_foundation}
                  </p>
                </div>
              </div>

              {/* Pricing and CTA */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">${program.price}</div>
                    <div className="text-sm text-muted-foreground">One-time payment</div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Lifetime Access
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Link to={`/programs/${program.slug}`} className="block">
                    <Button className="w-full">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <div className="text-center">
                    <Link 
                      to={`/programs/${program.slug}#enroll`}
                      className="text-sm text-primary hover:underline"
                    >
                      Quick Enroll
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredPrograms.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No programs found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Call to Action */}
      <div className="bg-muted/50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Not sure which program is right for you?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Our team can help you choose the perfect program based on your leadership experience, 
          goals, and calling. Schedule a free consultation to get personalized recommendations.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/contact">
            <Button size="lg">
              Schedule Consultation
            </Button>
          </Link>
          <Link to="/resources">
            <Button size="lg" variant="outline">
              Free Resources
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Programs

