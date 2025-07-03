import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { Separator } from '../ui/separator'
import { 
  CreditCard, 
  Shield, 
  Clock, 
  BookOpen, 
  Award,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function EnrollmentFlow({ program, onClose }) {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEnrollment = async () => {
    if (!user) {
      setError('Please sign in to enroll in this program')
      return
    }

    try {
      setLoading(true)
      setError('')

      // Create checkout session
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          program_id: program.id,
          user_id: user.id,
          customer_email: user.email
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.checkout_url

    } catch (err) {
      setError(err.message)
      console.error('Enrollment error:', err)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: <BookOpen className="h-5 w-5 text-primary" />,
      title: "Complete Curriculum",
      description: `${program.modules?.length || 12} comprehensive modules`
    },
    {
      icon: <Clock className="h-5 w-5 text-primary" />,
      title: "Flexible Learning",
      description: `${program.duration_weeks} weeks of self-paced content`
    },
    {
      icon: <Award className="h-5 w-5 text-primary" />,
      title: "Certification",
      description: "Receive certificate upon completion"
    },
    {
      icon: <Shield className="h-5 w-5 text-primary" />,
      title: "Lifetime Access",
      description: "Access materials anytime, anywhere"
    }
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Program Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{program.program_type}</Badge>
            <span className="text-sm text-muted-foreground">
              {program.duration_weeks} weeks
            </span>
          </div>
          <CardTitle className="text-2xl">{program.name}</CardTitle>
          <CardDescription className="text-base">
            {program.long_description || program.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Biblical Foundation */}
            <div>
              <h4 className="font-medium mb-2">Biblical Foundation</h4>
              <p className="text-sm text-muted-foreground">
                {program.biblical_foundation}
              </p>
            </div>

            {/* Learning Outcomes */}
            <div>
              <h4 className="font-medium mb-2">What You'll Learn</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {program.learning_outcomes?.map((outcome, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Audience */}
            {program.target_audience && (
              <div>
                <h4 className="font-medium mb-2">Perfect For</h4>
                <div className="flex flex-wrap gap-2">
                  {program.target_audience.map((audience, index) => (
                    <Badge key={index} variant="outline">
                      {audience}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>What's Included</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Investment</CardTitle>
          <CardDescription>
            Transform your leadership with biblical wisdom
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">${program.price}</div>
              <div className="text-sm text-muted-foreground">
                One-time payment • Lifetime access
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                Value: ${(program.price * 1.5).toFixed(0)}
              </div>
              <div className="text-sm font-medium text-green-600">
                Save ${(program.price * 0.5).toFixed(0)}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Program Access</span>
              <span>${program.price}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Certification</span>
              <span className="text-green-600">Included</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Community Access</span>
              <span className="text-green-600">Included</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Lifetime Updates</span>
              <span className="text-green-600">Included</span>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between font-medium">
            <span>Total</span>
            <span className="text-xl">${program.price}</span>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Enrollment Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Button 
              onClick={handleEnrollment} 
              disabled={loading}
              className="w-full text-lg py-6"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Enroll Now - ${program.price}
                </>
              )}
            </Button>

            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secure payment powered by Stripe</span>
              </div>
              <div className="text-xs text-muted-foreground">
                30-day money-back guarantee • Cancel anytime
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prerequisites */}
      {program.prerequisites && (
        <Card>
          <CardHeader>
            <CardTitle>Prerequisites</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {program.prerequisites}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default EnrollmentFlow

