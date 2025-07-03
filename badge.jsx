import React from 'react'

const badgeVariants = {
  default: 'bg-primary hover:bg-primary/80 text-primary-foreground',
  secondary: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground',
  destructive: 'bg-destructive hover:bg-destructive/80 text-destructive-foreground',
  outline: 'text-foreground border border-input'
}

export function Badge({ className = '', variant = 'default', children, ...props }) {
  const variantClass = badgeVariants[variant] || badgeVariants.default
  
  return (
    <div 
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

