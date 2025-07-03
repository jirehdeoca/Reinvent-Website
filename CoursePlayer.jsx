import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Alert, AlertDescription } from '../components/ui/alert'
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  CheckCircle, 
  Circle,
  BookOpen,
  FileText,
  Download,
  Clock,
  Award,
  ArrowLeft,
  ArrowRight,
  Volume2,
  Maximize,
  Settings
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getEnrollment, getModuleProgress, updateModuleProgress, completeModule } from '../lib/supabase'

export function CoursePlayer() {
  const { enrollmentId, moduleId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [enrollment, setEnrollment] = useState(null)
  const [currentModule, setCurrentModule] = useState(null)
  const [modules, setModules] = useState([])
  const [progress, setProgress] = useState({})
  const [videoProgress, setVideoProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [completedSections, setCompletedSections] = useState(new Set())

  useEffect(() => {
    if (enrollmentId && moduleId) {
      fetchCourseData()
    }
  }, [enrollmentId, moduleId])

  const fetchCourseData = async () => {
    try {
      setLoading(true)
      
      // Fetch enrollment details
      const { data: enrollmentData, error: enrollmentError } = await getEnrollment(enrollmentId)
      if (enrollmentError) throw enrollmentError
      
      setEnrollment(enrollmentData)
      setModules(enrollmentData.program.modules || [])
      
      // Find current module
      const module = enrollmentData.program.modules?.find(m => m.id === parseInt(moduleId))
      if (!module) {
        setError('Module not found')
        return
      }
      setCurrentModule(module)
      
      // Fetch progress for all modules
      const { data: progressData, error: progressError } = await getModuleProgress(user.id, enrollmentData.program.id)
      if (progressError) throw progressError
      
      const progressMap = {}
      progressData?.forEach(p => {
        progressMap[p.module_id] = p
      })
      setProgress(progressMap)
      
      // Set video progress for current module
      const moduleProgress = progressMap[parseInt(moduleId)]
      if (moduleProgress) {
        setVideoProgress(moduleProgress.video_progress_seconds || 0)
        setCompletedSections(new Set(moduleProgress.completed_sections || []))
      }
      
    } catch (err) {
      setError(err.message)
      console.error('Error fetching course data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVideoProgress = async (currentTime, duration) => {
    setVideoProgress(currentTime)
    
    // Update progress every 30 seconds
    if (Math.floor(currentTime) % 30 === 0) {
      try {
        await updateModuleProgress(user.id, currentModule.id, {
          video_progress_seconds: currentTime,
          video_duration_seconds: duration,
          last_accessed_at: new Date().toISOString()
        })
      } catch (error) {
        console.error('Error updating video progress:', error)
      }
    }
  }

  const handleSectionComplete = async (sectionType) => {
    const newCompleted = new Set(completedSections)
    newCompleted.add(sectionType)
    setCompletedSections(newCompleted)
    
    try {
      await updateModuleProgress(user.id, currentModule.id, {
        completed_sections: Array.from(newCompleted),
        last_accessed_at: new Date().toISOString()
      })
      
      // Check if module is fully complete
      const requiredSections = ['video', 'reading', 'assignment']
      const isModuleComplete = requiredSections.every(section => newCompleted.has(section))
      
      if (isModuleComplete && !progress[currentModule.id]?.completed_at) {
        await completeModule(user.id, currentModule.id)
        // Refresh progress data
        fetchCourseData()
      }
    } catch (error) {
      console.error('Error updating section completion:', error)
    }
  }

  const navigateToModule = (moduleIndex) => {
    const targetModule = modules[moduleIndex]
    if (targetModule) {
      navigate(`/course/${enrollmentId}/module/${targetModule.id}`)
    }
  }

  const getCurrentModuleIndex = () => {
    return modules.findIndex(m => m.id === parseInt(moduleId))
  }

  const getModuleProgress = (module) => {
    const moduleProgress = progress[module.id]
    if (!moduleProgress) return 0
    
    const sections = ['video', 'reading', 'assignment']
    const completedCount = sections.filter(section => 
      moduleProgress.completed_sections?.includes(section)
    ).length
    
    return (completedCount / sections.length) * 100
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

  if (error || !currentModule) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Module not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const currentIndex = getCurrentModuleIndex()
  const hasNext = currentIndex < modules.length - 1
  const hasPrevious = currentIndex > 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{enrollment?.program?.name}</h1>
                <p className="text-sm text-muted-foreground">
                  Module {currentIndex + 1} of {modules.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium">
                  {Math.round(getModuleProgress(currentModule))}% Complete
                </div>
                <Progress 
                  value={getModuleProgress(currentModule)} 
                  className="w-32"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Module Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    Module {currentIndex + 1}
                  </Badge>
                  {progress[currentModule.id]?.completed_at && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl">{currentModule.title}</CardTitle>
                <CardDescription>{currentModule.description}</CardDescription>
                
                {currentModule.biblical_principle && (
                  <div className="mt-4">
                    <Badge variant="outline" className="text-primary">
                      📖 {currentModule.biblical_principle}
                    </Badge>
                  </div>
                )}
              </CardHeader>
            </Card>

            {/* Course Content Tabs */}
            <Tabs defaultValue="video" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="video" className="flex items-center space-x-2">
                  <Play className="h-4 w-4" />
                  <span>Video</span>
                  {completedSections.has('video') && (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="reading" className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Reading</span>
                  {completedSections.has('reading') && (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="assignment" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Assignment</span>
                  {completedSections.has('assignment') && (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="resources" className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Resources</span>
                </TabsTrigger>
              </TabsList>

              {/* Video Content */}
              <TabsContent value="video">
                <Card>
                  <CardContent className="p-0">
                    <div className="aspect-video bg-black rounded-t-lg relative">
                      {currentModule.video_url ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-white text-center">
                            <Play className="h-16 w-16 mx-auto mb-4" />
                            <p>Video Player Component</p>
                            <p className="text-sm opacity-75">
                              Duration: {currentModule.video_duration_minutes} minutes
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <div className="text-center">
                            <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p>Video content coming soon</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                          {currentModule.title} - Video Lesson
                        </h3>
                        {currentModule.video_duration_minutes && (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {currentModule.video_duration_minutes} min
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground mb-4">
                        {currentModule.video_description || currentModule.description}
                      </p>
                      
                      {!completedSections.has('video') && (
                        <Button 
                          onClick={() => handleSectionComplete('video')}
                          className="w-full"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Video as Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reading Content */}
              <TabsContent value="reading">
                <Card>
                  <CardHeader>
                    <CardTitle>Reading Material</CardTitle>
                    <CardDescription>
                      Study the key concepts and biblical foundations for this module
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="prose max-w-none">
                      <h3>Key Learning Objectives</h3>
                      <ul>
                        {currentModule.learning_objectives?.map((objective, index) => (
                          <li key={index}>{objective}</li>
                        )) || [
                          'Understand the biblical foundation for this leadership principle',
                          'Learn practical application strategies',
                          'Develop personal action plans for implementation'
                        ]}
                      </ul>
                      
                      <h3>Biblical Foundation</h3>
                      <p>{currentModule.biblical_foundation || 'Explore how Scripture guides this aspect of leadership development.'}</p>
                      
                      <h3>Practical Application</h3>
                      <p>Consider how these principles apply to your current leadership context and challenges.</p>
                    </div>
                    
                    {currentModule.reading_materials && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Additional Reading</h4>
                        {currentModule.reading_materials.map((material, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                            <FileText className="h-4 w-4" />
                            <span>{material.title}</span>
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {!completedSections.has('reading') && (
                      <Button 
                        onClick={() => handleSectionComplete('reading')}
                        className="w-full"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Reading as Complete
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Assignment Content */}
              <TabsContent value="assignment">
                <Card>
                  <CardHeader>
                    <CardTitle>Module Assignment</CardTitle>
                    <CardDescription>
                      Apply what you've learned through practical exercises
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Assignment Instructions</h4>
                        <p className="text-muted-foreground">
                          {currentModule.assignment_instructions || 
                           'Reflect on the key concepts from this module and create a personal action plan for implementing these leadership principles in your current role.'}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Reflection Questions</h4>
                        <ul className="space-y-2 text-muted-foreground">
                          <li>• How does this biblical principle challenge your current leadership approach?</li>
                          <li>• What specific actions will you take to implement these concepts?</li>
                          <li>• How will you measure progress in this area?</li>
                          <li>• What obstacles might you face, and how will you overcome them?</li>
                        </ul>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">Submit Your Response</h4>
                        <textarea 
                          className="w-full h-32 p-3 border rounded resize-none"
                          placeholder="Share your reflections and action plan here..."
                        />
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-sm text-muted-foreground">
                            Your response will be saved automatically
                          </span>
                          <Button size="sm">Save Draft</Button>
                        </div>
                      </div>
                    </div>
                    
                    {!completedSections.has('assignment') && (
                      <Button 
                        onClick={() => handleSectionComplete('assignment')}
                        className="w-full"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Submit Assignment
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Resources Content */}
              <TabsContent value="resources">
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Resources</CardTitle>
                    <CardDescription>
                      Supplementary materials to deepen your understanding
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <h4 className="font-medium">Study Guide</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Comprehensive study guide with key concepts and discussion questions
                        </p>
                        <Button size="sm" variant="outline" className="w-full">
                          <Download className="h-3 w-3 mr-1" />
                          Download PDF
                        </Button>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                          <h4 className="font-medium">Recommended Reading</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Books and articles for deeper exploration of these concepts
                        </p>
                        <Button size="sm" variant="outline" className="w-full">
                          View List
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button 
                variant="outline" 
                onClick={() => navigateToModule(currentIndex - 1)}
                disabled={!hasPrevious}
              >
                <SkipBack className="h-4 w-4 mr-2" />
                Previous Module
              </Button>
              
              <Button 
                onClick={() => navigateToModule(currentIndex + 1)}
                disabled={!hasNext}
              >
                Next Module
                <SkipForward className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Course Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Overall Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span>{Math.round(enrollment?.progress_percentage || 0)}%</span>
                  </div>
                  <Progress value={enrollment?.progress_percentage || 0} />
                </div>

                {/* Module List */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Modules</h4>
                  {modules.map((module, index) => (
                    <div 
                      key={module.id}
                      className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
                        module.id === parseInt(moduleId) 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => navigateToModule(index)}
                    >
                      <div className="flex-shrink-0">
                        {progress[module.id]?.completed_at ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {index + 1}. {module.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Progress 
                            value={getModuleProgress(module)} 
                            className="flex-1 h-1"
                          />
                          <span className="text-xs text-muted-foreground">
                            {Math.round(getModuleProgress(module))}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Certificate */}
                {enrollment?.progress_percentage === 100 && (
                  <div className="border rounded-lg p-4 text-center">
                    <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <h4 className="font-medium">Congratulations!</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      You've completed the course
                    </p>
                    <Button size="sm" className="w-full">
                      Download Certificate
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoursePlayer

