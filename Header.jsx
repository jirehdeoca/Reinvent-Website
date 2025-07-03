import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings,
  BookOpen,
  Users,
  Calendar,
  Bell,
  Shield,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { NotificationBell } from '../notifications/NotificationSystem'
import AuthModal from '../auth/AuthModal'

export function Header() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    setShowUserMenu(false)
  }

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const navigation = [
    { name: 'Home', href: '/', public: true },
    { name: 'About', href: '/about', public: true },
    { name: 'Programs', href: '/programs', public: true },
    { name: 'Dashboard', href: '/dashboard', protected: true },
    { name: 'Community', href: '/community', protected: true },
    { name: 'Coaching', href: '/coaching', protected: true },
  ]

  const userMenuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: BookOpen },
    { name: 'Community', href: '/community', icon: Users },
    { name: 'Coaching', href: '/coaching', icon: Calendar },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  if (user?.role === 'admin') {
    userMenuItems.push({ name: 'Admin', href: '/admin', icon: Shield })
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Reinvent International
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const shouldShow = item.public || (item.protected && user)
              if (!shouldShow) return null

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePath(item.href)
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notification Bell */}
                <NotificationBell />

                {/* User Menu */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border rounded-lg shadow-lg z-50">
                      <div className="p-3 border-b">
                        <p className="font-medium text-sm">
                          {user.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        {user.role && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {user.role}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="py-1">
                        {userMenuItems.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50"
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        ))}
                      </div>
                      
                      <div className="border-t py-1">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowAuthModal(true)}
                >
                  Sign In
                </Button>
                <Button onClick={() => setShowAuthModal(true)}>
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const shouldShow = item.public || (item.protected && user)
                if (!shouldShow) return null

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActivePath(item.href)
                        ? 'text-primary bg-primary/10'
                        : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
              
              {!user && (
                <div className="pt-4 border-t border-gray-200">
                  <Button 
                    className="w-full mb-2" 
                    onClick={() => {
                      setShowAuthModal(true)
                      setShowMobileMenu(false)
                    }}
                  >
                    Get Started
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setShowAuthModal(true)
                      setShowMobileMenu(false)
                    }}
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </header>
  )
}

export default Header

