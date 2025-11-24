import React from 'react'

export default function BackgroundEffects() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary Absolute Black Base */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: '#050406' }}
      />
      
      {/* Neon Cyan Particles */}
      <div className="absolute top-20 left-20 w-2 h-2 rounded-full animate-ping opacity-40" 
           style={{ backgroundColor: '#00ffff', boxShadow: '0 0 20px #00ffff' }} />
      <div className="absolute top-60 right-40 w-1 h-1 rounded-full animate-pulse opacity-30 delay-1000"
           style={{ backgroundColor: '#00ffff', boxShadow: '0 0 15px #00ffff' }} />
      <div className="absolute bottom-40 left-20 w-1.5 h-1.5 rounded-full animate-bounce opacity-25 delay-2000"
           style={{ backgroundColor: '#00ffff', boxShadow: '0 0 10px #00ffff' }} />
      
      {/* Electric Violet Particles */}
      <div className="absolute top-32 right-20 w-1.5 h-1.5 rounded-full animate-ping opacity-35 delay-500"
           style={{ backgroundColor: '#8a2be2', boxShadow: '0 0 18px #8a2be2' }} />
      <div className="absolute bottom-60 right-60 w-1 h-1 rounded-full animate-pulse opacity-30 delay-1500"
           style={{ backgroundColor: '#8a2be2', boxShadow: '0 0 12px #8a2be2' }} />
      
      {/* Venom Red Particles */}
      <div className="absolute top-40 left-1/3 w-1 h-1 rounded-full animate-bounce opacity-25 delay-3000"
           style={{ backgroundColor: '#ff0040', boxShadow: '0 0 15px #ff0040' }} />
      <div className="absolute bottom-20 right-1/4 w-1.5 h-1.5 rounded-full animate-ping opacity-30 delay-2500"
           style={{ backgroundColor: '#ff0040', boxShadow: '0 0 20px #ff0040' }} />
      
      {/* Large Ambient Glow Effects - NO ROTATION */}
      <div 
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-15 animate-pulse"
        style={{ 
          background: 'radial-gradient(circle, #00ffff 0%, #8a2be2 50%, transparent 70%)',
          animation: 'float 6s ease-in-out infinite'
        }} 
      />
      <div 
        className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-12 animate-pulse delay-1000"
        style={{ 
          background: 'radial-gradient(circle, #8a2be2 0%, #ff0040 50%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite reverse'
        }} 
      />
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8 animate-pulse delay-500"
        style={{ 
          background: 'radial-gradient(circle, #00ffff 0%, #8a2be2 30%, #ff0040 60%, transparent 80%)'
        }} 
      />
      
      {/* Float Animation - NO ROTATION */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  )
}
