import React from 'react'

// Design System Constants
export const COLORS = {
  // Base Colors
  base: '#050406',
  glass: 'rgba(5, 4, 6, 0.8)',
  glassLight: 'rgba(5, 4, 6, 0.6)',
  glassDark: 'rgba(5, 4, 6, 0.95)',
  
  // Accent Gradients
  neonCyan: '#00ffff',
  electricViolet: '#8a2be2',
  venomRed: '#ff0040',
  
  // Gradients
  primary: 'linear-gradient(135deg, #00ffff 0%, #8a2be2 50%, #ff0040 100%)',
  primaryReverse: 'linear-gradient(315deg, #00ffff 0%, #8a2be2 50%, #ff0040 100%)',
  accent: 'linear-gradient(90deg, #00ffff 0%, #8a2be2 100%)',
  danger: 'linear-gradient(90deg, #ff0040 0%, #ff6b6b 100%)',
  
  // Glass Effects
  glassPanel: 'rgba(255, 255, 255, 0.05)',
  glassPanelHover: 'rgba(255, 255, 255, 0.1)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  glassBorderHover: 'rgba(0, 255, 255, 0.3)',
  
  // Text Colors
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  textAccent: '#00ffff',
}

export const ANIMATIONS = {
  // Gradient Ring Animation
  gradientRing: `
    @keyframes gradientRing {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `,
  
  // Pulse Glow Animation
  pulseGlow: `
    @keyframes pulseGlow {
      0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.3); }
      50% { box-shadow: 0 0 40px rgba(0, 255, 255, 0.6); }
    }
  `,
  
  // Float Animation
  float: `
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
  `,
  
  // Shimmer Animation
  shimmer: `
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `,
}

// Glass Panel Component
interface GlassPanelProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  onClick?: () => void
}

export const GlassPanel: React.FC<GlassPanelProps> = ({ 
  children, 
  className = '', 
  hover = true, 
  glow = false,
  onClick 
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative backdrop-blur-xl border transition-all duration-300
        ${hover ? 'hover:translate-y-[-2px] hover:shadow-2xl' : ''}
        ${glow ? 'shadow-[0_0_30px_rgba(0,255,255,0.3)]' : ''}
        ${className}
      `}
      style={{
        background: COLORS.glassPanel,
        borderColor: COLORS.glassBorder,
        boxShadow: glow ? '0 0 30px rgba(0, 255, 255, 0.3)' : undefined,
      }}
    >
      {/* Animated Border */}
      <div 
        className="absolute inset-0 rounded-inherit opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${COLORS.neonCyan}, ${COLORS.electricViolet}, ${COLORS.venomRed})`,
          backgroundSize: '200% 200%',
          animation: 'gradientRing 3s ease infinite',
          padding: '1px',
          borderRadius: 'inherit',
        }}
      >
        <div 
          className="w-full h-full rounded-inherit"
          style={{ background: COLORS.base }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// Neon Button Component
interface NeonButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export const NeonButton: React.FC<NeonButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: COLORS.primary,
          color: COLORS.base,
        }
      case 'secondary':
        return {
          background: COLORS.glassPanel,
          color: COLORS.textPrimary,
          border: `1px solid ${COLORS.glassBorder}`,
        }
      case 'danger':
        return {
          background: COLORS.danger,
          color: COLORS.textPrimary,
        }
      default:
        return {}
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm'
      case 'md':
        return 'px-4 py-2 text-base'
      case 'lg':
        return 'px-6 py-3 text-lg'
      default:
        return 'px-4 py-2 text-base'
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative font-mono font-medium rounded-lg transition-all duration-300
        hover:translate-y-[-1px] hover:shadow-lg
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getSizeStyles()}
        ${className}
      `}
      style={getVariantStyles()}
    >
      {children}
    </button>
  )
}

// Monospace File List Component
interface FileListProps {
  files: Array<{
    id: string
    name: string
    type: 'file' | 'folder'
    size?: string
    children?: Array<any>
  }>
  onToggleFolder?: (id: string) => void
  onCopyPath?: (path: string) => void
}

export const MonospaceFileList: React.FC<FileListProps> = ({ 
  files, 
  onToggleFolder, 
  onCopyPath 
}) => {
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(new Set())

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedFolders(newExpanded)
    onToggleFolder?.(id)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    onCopyPath?.(text)
  }

  return (
    <div className="font-mono text-sm">
      {files.map((file) => (
        <div key={file.id} className="group">
          <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded transition-colors">
            <div className="flex items-center space-x-2">
              {file.type === 'folder' && (
                <button
                  onClick={() => toggleFolder(file.id)}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  {expandedFolders.has(file.id) ? '▼' : '▶'}
                </button>
              )}
              <span className={file.type === 'folder' ? 'text-cyan-400' : 'text-white'}>
                {file.name}
              </span>
              {file.size && (
                <span className="text-gray-500 text-xs">{file.size}</span>
              )}
            </div>
            <button
              onClick={() => copyToClipboard(file.name)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white text-xs px-2 py-1 rounded transition-all"
            >
              copy
            </button>
          </div>
          
          {file.type === 'folder' && expandedFolders.has(file.id) && file.children && (
            <div className="ml-6 border-l border-gray-600">
              <MonospaceFileList 
                files={file.children} 
                onToggleFolder={onToggleFolder}
                onCopyPath={onCopyPath}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// CSS Variables Export
export const cssVariables = `
:root {
  /* Base Colors */
  --color-base: ${COLORS.base};
  --color-glass: ${COLORS.glass};
  --color-glass-light: ${COLORS.glassLight};
  --color-glass-dark: ${COLORS.glassDark};
  
  /* Accent Colors */
  --color-neon-cyan: ${COLORS.neonCyan};
  --color-electric-violet: ${COLORS.electricViolet};
  --color-venom-red: ${COLORS.venomRed};
  
  /* Gradients */
  --gradient-primary: ${COLORS.primary};
  --gradient-primary-reverse: ${COLORS.primaryReverse};
  --gradient-accent: ${COLORS.accent};
  --gradient-danger: ${COLORS.danger};
  
  /* Glass Effects */
  --glass-panel: ${COLORS.glassPanel};
  --glass-panel-hover: ${COLORS.glassPanelHover};
  --glass-border: ${COLORS.glassBorder};
  --glass-border-hover: ${COLORS.glassBorderHover};
  
  /* Text Colors */
  --text-primary: ${COLORS.textPrimary};
  --text-secondary: ${COLORS.textSecondary};
  --text-muted: ${COLORS.textMuted};
  --text-accent: ${COLORS.textAccent};
}

/* Animations */
${ANIMATIONS.gradientRing}
${ANIMATIONS.pulseGlow}
${ANIMATIONS.float}
${ANIMATIONS.shimmer}

/* Utility Classes */
.glass-panel {
  background: var(--glass-panel);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}

.glass-panel:hover {
  background: var(--glass-panel-hover);
  border-color: var(--glass-border-hover);
}

.gradient-ring {
  position: relative;
}

.gradient-ring::before {
  content: '';
  position: absolute;
  inset: -1px;
  background: var(--gradient-primary);
  background-size: 200% 200%;
  animation: gradientRing 3s ease infinite;
  border-radius: inherit;
  z-index: -1;
}

.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 255, 255, 0.2);
}
`

// Export function to copy CSS variables
export const copyCSSVariables = () => {
  navigator.clipboard.writeText(cssVariables)
  console.log('CSS Variables copied to clipboard!')
}

export default {
  COLORS,
  ANIMATIONS,
  GlassPanel,
  NeonButton,
  MonospaceFileList,
  cssVariables,
  copyCSSVariables,
}
