import React, { createContext, useContext, useState } from 'react'

const DialogContext = createContext()

export function Dialog({ open, onOpenChange, children }) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = open !== undefined ? open : internalOpen
  
  const handleOpenChange = (newOpen) => {
    if (open === undefined) {
      setInternalOpen(newOpen)
    }
    if (onOpenChange) {
      onOpenChange(newOpen)
    }
  }

  return (
    <DialogContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => handleOpenChange(false)}
          />
          <div className="relative z-50">
            {children}
          </div>
        </div>
      )}
    </DialogContext.Provider>
  )
}

export function DialogTrigger({ children, ...props }) {
  const context = useContext(DialogContext)
  
  return (
    <div onClick={() => context?.onOpenChange(true)} {...props}>
      {children}
    </div>
  )
}

export function DialogContent({ className = '', children, ...props }) {
  const context = useContext(DialogContext)
  
  if (!context?.open) return null
  
  return (
    <div 
      className={`fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function DialogHeader({ className = '', children, ...props }) {
  return (
    <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`} {...props}>
      {children}
    </div>
  )
}

export function DialogTitle({ className = '', children, ...props }) {
  return (
    <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props}>
      {children}
    </h2>
  )
}

export function DialogDescription({ className = '', children, ...props }) {
  return (
    <p className={`text-sm text-muted-foreground ${className}`} {...props}>
      {children}
    </p>
  )
}

