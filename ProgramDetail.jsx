import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Alert, AlertDescription } from '../components/ui/alert'
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  CheckCircle,
  Play,
  Award,
  Heart,
  ArrowLeft,
  Calendar,
  Target,
  Lightbulb,
  Shield
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getProgram, getUserEnrollments } from '../lib/supabase'
import EnrollmentFlow from '../components/enrollment/EnrollmentFlow'

export function ProgramDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [program, setProgram] = useState(null)
  const [userEnrollments, setUserEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)

  useEffect(() => {
    if (slug) {
      fetchProgramData()
    }
  }, [slug, user])

  useEffect(() => {
    // Check if user is enrolled when program or enrollments change
    if (program && userEnrollments.length > 0) {
      const enrollment = userEnrollments.find(e => e.program_id === program.id)
      setIsEnrolled(!!enrollment)
    }
  }, [program, userEnrollments])

  const fetchProgramData = async () => {
    try {
      setLoading(true)
      
      // Fetch program details
      const { data: programData, error: programError } = await getProgram(slug)
      if (programError) throw programError
      
      if (!programData) {
        setError('Program not found')
        return
      }
      
      setProgram(programData)

      // Fetch user enrollments if logged in
      if (user) {
        const { data: enrollmentsData, error: enrollmentsError } = await getUserEnrollments(user.id)
        if (enrollmentsError) throw enrollmentsError
        setUserEnrollments(enrollmentsData || [])
      }

    } catch (err) {
      setError(err.message)
      console.error('Error fetching program:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEnrollmentSuccess = () => {
    setEnrollmentModalOpen(false)
    fetchProgramData() // Refresh data
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

  if (error || !program) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Program not found'}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link to="/programs">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Programs
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const features = [
    {
      icon: <BookOpen className="h-6 w-6 text-primary" />,
      title: "Comprehensive Curriculum",
      description: `${program.modules?.length || 12} detailed modules covering all aspects of biblical leadership`
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Flexible Schedule",
      description: `${program.duration_weeks} weeks of self-paced learning with weekly live sessions`
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Community Access",
      description: "Join a community of like-minded Christian leaders for support and networking"
    },
    {
      icon: <Award className="h-6 w-6 text-primary" />,
      title: "Certification",
      description: "Receive an accredited certificate upon successful completion"
    },
    {
      icon: <Heart className="h-6 w-6 text-primary" />,
      title: "Spiritual Growth",
      description: "Integrate faith with professional development for holistic growth"
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Lifetime Access",
      description: "Access all materials, updates, and community features for life"
    }
  ]

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Back Navigation */}
      <div>
        <Link to="/programs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Programs
          </Button>
        </Link>
      </div>

      {/* Program Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <Badge variant="secondary" className="text-sm">
                {program.program_type}
              </Badge>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm text-muted-foreground ml-2">4.9 (2,500+ reviews)</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-4">{program.name}</h1>
            <p className="text-xl text-muted-foreground mb-6">
              {program.long_description || program.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                <Award className="h-4 w-4 text-muted-foreground" />
                <span>Certificate included</span>
              </div>
            </div>
          </div>

          {/* Program Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="testimonials">Reviews</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Biblical Foundation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5" />
                    <span>Biblical Foundation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {program.biblical_foundation}
                  </p>
                </CardContent>
              </Card>

              {/* Learning Outcomes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>What You'll Learn</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {program.learning_outcomes?.map((outcome, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{outcome}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Target Audience */}
              {program.target_audience && (
                <Card>
                  <CardHeader>
                    <CardTitle>Perfect For</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {program.target_audience.map((audience, index) => (
                        <Badge key={index} variant="outline">
                          {audience}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle>Program Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        {feature.icon}
                        <div>
                          <h4 className="font-medium">{feature.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="curriculum" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Course Modules</CardTitle>
                  <CardDescription>
                    Comprehensive curriculum designed to transform your leadership
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {program.modules?.map((module, index) => (
                      <div key={module.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Badge variant="outline">Module {index + 1}</Badge>
                              {module.video_duration_minutes && (
                                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                  <Play className="h-4 w-4" />
                                  <span>{module.video_duration_minutes} min</span>
                                </div>
                              )}
                            </div>
                            <h4 className="font-medium mb-1">{module.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {module.description}
                            </p>
                            {module.biblical_principle && (
                              <div className="mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  {module.biblical_principle}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-muted-foreground">
                        Curriculum details will be available after enrollment
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="testimonials" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sample testimonials */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <CardDescription className="italic">
                      "This program transformed my leadership approach completely. The biblical foundation gave me confidence to lead with integrity."
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Sarah Johnson</div>
                        <div className="text-sm text-muted-foreground">VP of Operations</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <CardDescription className="italic">
                      "The practical application of biblical principles in business scenarios was exactly what I needed for my leadership journey."
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Michael Chen</div>
                        <div className="text-sm text-muted-foreground">CEO</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="faq" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-2">How long do I have access to the program?</h4>
                      <p className="text-sm text-muted-foreground">
                        You have lifetime access to all program materials, including any future updates and the community platform.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Is this program suitable for non-Christians?</h4>
                      <p className="text-sm text-muted-foreground">
                        While the program is grounded in biblical principles, the leadership concepts are valuable for anyone seeking ethical, character-based leadership development.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">What if I need to pause my learning?</h4>
                      <p className="text-sm text-muted-foreground">
                        The program is self-paced, so you can take breaks as needed. Your progress is saved and you can resume anytime.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Do you offer refunds?</h4>
                      <p className="text-sm text-muted-foreground">
                        Yes, we offer a 30-day money-back guarantee if you're not satisfied with the program.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Enrollment Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <div className="text-center">
                <div className="text-3xl font-bold">${program.price}</div>
                <div className="text-sm text-muted-foreground">One-time payment</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEnrolled ? (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      You're enrolled in this program!
                    </AlertDescription>
                  </Alert>
                  <Link to="/dashboard">
                    <Button className="w-full">
                      Continue Learning
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <Dialog open={enrollmentModalOpen} onOpenChange={setEnrollmentModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full text-lg py-6" size="lg">
                        Enroll Now - ${program.price}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Enroll in {program.name}</DialogTitle>
                      </DialogHeader>
                      <EnrollmentFlow 
                        program={program} 
                        onClose={() => setEnrollmentModalOpen(false)}
                        onSuccess={handleEnrollmentSuccess}
                      />
                    </DialogContent>
                  </Dialog>

                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>30-day money-back guarantee</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Secure payment • Instant access • Lifetime updates
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Info */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span>Duration</span>
                  <span>{program.duration_weeks} weeks</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Modules</span>
                  <span>{program.modules?.length || 12}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Certificate</span>
                  <span className="text-green-600">Included</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Community Access</span>
                  <span className="text-green-600">Lifetime</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProgramDetail

