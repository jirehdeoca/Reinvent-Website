import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { 
  BookOpen, 
  Users, 
  Award, 
  ArrowRight, 
  Star,
  CheckCircle,
  Heart,
  Target,
  Lightbulb
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getPrograms, getTestimonials } from '../lib/supabase'
import AuthModal from '../components/auth/AuthModal'

export function Home() {
  const { user } = useAuth()
  const [programs, setPrograms] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      // Fetch programs
      const { data: programsData } = await getPrograms()
      setPrograms(programsData?.slice(0, 4) || [])

      // Fetch featured testimonials
      const { data: testimonialsData } = await getTestimonials(true)
      setTestimonials(testimonialsData?.slice(0, 3) || [])
    } catch (error) {
      console.error('Error fetching home data:', error)
    } finally {
      setLoading(false)
    }
  }

  const valuePropositions = [
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "Biblical Foundation",
      description: "Every leadership principle is grounded in biblical wisdom, providing timeless guidance for modern business challenges."
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Professional Excellence",
      description: "Maintain the highest standards of corporate training while integrating faith-based values and principles."
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-primary" />,
      title: "Transformational Growth",
      description: "Experience personal and professional transformation through our proven methodology that develops both character and competence."
    }
  ]

  const stats = [
    { number: "2,500+", label: "Leaders Trained" },
    { number: "95%", label: "Completion Rate" },
    { number: "4.9/5", label: "Average Rating" },
    { number: "50+", label: "Countries Reached" }
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Transform Your Leadership Through Biblical Wisdom
            </h1>
            <p className="text-xl lg:text-2xl mb-8 opacity-90">
              Integrating professional excellence with faith-based principles to develop leaders who inspire change and contribute to a greater purpose.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                    Continue Learning
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="text-lg px-8 py-3"
                  onClick={() => setAuthModalOpen(true)}
                >
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
              <Link to="/programs">
                <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Explore Programs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Faith-Integrated Leadership Development
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We believe that the most effective leaders are those who integrate their faith with their professional expertise, creating positive impact in their organizations and communities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {valuePropositions.map((prop, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4">
                    {prop.icon}
                  </div>
                  <CardTitle>{prop.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {prop.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Our Training Programs
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive leadership development programs designed to integrate biblical principles with professional excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((program) => (
              <Card key={program.id} className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{program.program_type}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {program.duration_weeks} weeks
                    </span>
                  </div>
                  <CardTitle className="text-lg">{program.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <CardDescription className="flex-1 mb-4">
                    {program.description}
                  </CardDescription>
                  
                  <div className="space-y-3">
                    <div className="text-2xl font-bold text-primary">
                      ${program.price}
                    </div>
                    
                    <div className="space-y-2">
                      {program.learning_outcomes?.slice(0, 3).map((outcome, index) => (
                        <div key={index} className="flex items-start space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{outcome}</span>
                        </div>
                      ))}
                    </div>

                    <Link to={`/programs/${program.slug}`} className="block">
                      <Button className="w-full">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/programs">
              <Button size="lg" variant="outline">
                View All Programs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Transformation Stories
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Hear from leaders who have experienced both professional growth and spiritual development through our programs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id}>
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-base italic">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{testimonial.user?.full_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.program?.name}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Transform Your Leadership?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of Christian leaders who have discovered how to integrate their faith with professional excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/programs">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                  Explore Programs
                  <BookOpen className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="text-lg px-8 py-3"
                  onClick={() => setAuthModalOpen(true)}
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    Learn More
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab="signup"
      />
    </div>
  )
}

export default Home

