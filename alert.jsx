import React from 'react'

const alertVariants = {
  default: 'bg-background text-foreground border',
  destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive'
}

export function Alert({ className = '', variant = 'default', children, ...props }) {
  const variantClass = alertVariants[variant] || alertVariants.default
  
  return (
    <div 
      className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function AlertDescription({ className = '', children, ...props }) {
  return (
    <div className={`text-sm [&_p]:leading-relaxed ${className}`} {...props}>
      {children}
    </div>
  )
}

