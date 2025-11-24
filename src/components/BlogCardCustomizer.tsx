'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GradientCustomizer from './GradientCustomizer';
import { 
  Palette, 
  Eye, 
  RotateCcw, 
  Save,
  Sparkles,
  Layout,
  Type,
  Shadow,
  Zap
} from 'lucide-react';

interface BlogCardStyle {
  background: string;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  shadowIntensity: number;
  shadowColor: string;
  titleColor: string;
  textColor: string;
  accentColor: string;
  hoverEffect: string;
  animation: string;
  opacity: number;
}

interface BlogCardCustomizerProps {
  value: BlogCardStyle;
  onChange: (style: BlogCardStyle) => void;
  className?: string;
}

const defaultStyle: BlogCardStyle = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#374151',
  shadowIntensity: 20,
  shadowColor: '#000000',
  titleColor: '#ffffff',
  textColor: '#d1d5db',
  accentColor: '#3b82f6',
  hoverEffect: 'scale',
  animation: 'fadeIn',
  opacity: 95
};

const hoverEffects = [
  { name: 'Scale Up', value: 'scale' },
  { name: 'Lift Up', value: 'lift' },
  { name: 'Glow', value: 'glow' },
  { name: 'Rotate', value: 'rotate' },
  { name: 'Slide', value: 'slide' },
  { name: 'None', value: 'none' }
];

const animations = [
  { name: 'Fade In', value: 'fadeIn' },
  { name: 'Slide Up', value: 'slideUp' },
  { name: 'Slide Down', value: 'slideDown' },
  { name: 'Zoom In', value: 'zoomIn' },
  { name: 'Bounce In', value: 'bounceIn' },
  { name: 'None', value: 'none' }
];

export default function BlogCardCustomizer({ value, onChange, className = "" }: BlogCardCustomizerProps) {
  const [previewMode, setPreviewMode] = useState(false);

  const updateStyle = (key: keyof BlogCardStyle, newValue: any) => {
    onChange({ ...value, [key]: newValue });
  };

  const resetToDefault = () => {
    onChange(defaultStyle);
  };

  const generateCSS = () => {
    const hoverTransform = {
      scale: 'scale(1.05)',
      lift: 'translateY(-8px)',
      glow: 'scale(1.02)',
      rotate: 'rotate(2deg) scale(1.02)',
      slide: 'translateX(8px)',
      none: 'none'
    };

    const animationKeyframes = {
      fadeIn: 'fadeIn 0.6s ease-out',
      slideUp: 'slideUp 0.6s ease-out',
      slideDown: 'slideDown 0.6s ease-out',
      zoomIn: 'zoomIn 0.6s ease-out',
      bounceIn: 'bounceIn 0.8s ease-out',
      none: 'none'
    };

    return `
      .blog-card-custom {
        background: ${value.background};
        border-radius: ${value.borderRadius}px;
        border: ${value.borderWidth}px solid ${value.borderColor};
        box-shadow: 0 ${value.shadowIntensity}px ${value.shadowIntensity * 2}px ${value.shadowColor}40;
        opacity: ${value.opacity / 100};
        animation: ${animationKeyframes[value.animation as keyof typeof animationKeyframes]};
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .blog-card-custom:hover {
        transform: ${hoverTransform[value.hoverEffect as keyof typeof hoverTransform]};
        box-shadow: 0 ${value.shadowIntensity * 1.5}px ${value.shadowIntensity * 3}px ${value.shadowColor}60;
        ${value.hoverEffect === 'glow' ? `box-shadow: 0 0 30px ${value.accentColor}40;` : ''}
      }
      
      .blog-card-custom .title {
        color: ${value.titleColor};
      }
      
      .blog-card-custom .text {
        color: ${value.textColor};
      }
      
      .blog-card-custom .accent {
        color: ${value.accentColor};
      }
    `;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Preview */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Layout className="h-5 w-5 text-blue-400" />
              Blog Card Preview
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Sample Blog Card */}
          <div className="blog-card-custom p-6 max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <div>
                <h4 className="title font-semibold">John Doe</h4>
                <p className="text text-sm">2 hours ago</p>
              </div>
            </div>
            <h3 className="title text-xl font-bold mb-2">Sample Blog Post Title</h3>
            <p className="text mb-4">This is a sample blog post excerpt that shows how your customized card will look with real content...</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="accent">❤️ 124</span>
              <span className="accent">💬 18</span>
              <span className="accent">👁️ 2.3k</span>
            </div>
          </div>
          
          {/* CSS Output */}
          <div className="mt-6">
            <Label className="text-white mb-2 block">Generated CSS:</Label>
            <textarea
              value={generateCSS()}
              readOnly
              className="w-full h-32 bg-gray-700 border-gray-600 text-white font-mono text-xs p-3 rounded"
            />
          </div>
        </CardContent>
      </Card>

      {!previewMode && (
        <>
          {/* Quick Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={resetToDefault}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Background Customizer */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Palette className="h-5 w-5 text-blue-400" />
                Background
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GradientCustomizer
                value={value.background}
                onChange={(bg) => updateStyle('background', bg)}
              />
            </CardContent>
          </Card>

          {/* Layout & Spacing */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Layout className="h-5 w-5 text-green-400" />
                Layout & Spacing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Border Radius</Label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={value.borderRadius}
                    onChange={(e) => updateStyle('borderRadius', parseInt(e.target.value))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Border Width</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={value.borderWidth}
                    onChange={(e) => updateStyle('borderWidth', parseInt(e.target.value))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Border Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={value.borderColor}
                    onChange={(e) => updateStyle('borderColor', e.target.value)}
                    className="w-16 h-10 bg-gray-700 border-gray-600"
                  />
                  <Input
                    value={value.borderColor}
                    onChange={(e) => updateStyle('borderColor', e.target.value)}
                    className="flex-1 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Colors */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Type className="h-5 w-5 text-purple-400" />
                Typography Colors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Title Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={value.titleColor}
                      onChange={(e) => updateStyle('titleColor', e.target.value)}
                      className="w-16 h-10 bg-gray-700 border-gray-600"
                    />
                    <Input
                      value={value.titleColor}
                      onChange={(e) => updateStyle('titleColor', e.target.value)}
                      className="flex-1 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={value.textColor}
                      onChange={(e) => updateStyle('textColor', e.target.value)}
                      className="w-16 h-10 bg-gray-700 border-gray-600"
                    />
                    <Input
                      value={value.textColor}
                      onChange={(e) => updateStyle('textColor', e.target.value)}
                      className="flex-1 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={value.accentColor}
                      onChange={(e) => updateStyle('accentColor', e.target.value)}
                      className="w-16 h-10 bg-gray-700 border-gray-600"
                    />
                    <Input
                      value={value.accentColor}
                      onChange={(e) => updateStyle('accentColor', e.target.value)}
                      className="flex-1 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Effects */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                Effects & Animation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Hover Effect</Label>
                  <select
                    value={value.hoverEffect}
                    onChange={(e) => updateStyle('hoverEffect', e.target.value)}
                    className="w-full bg-gray-700 border-gray-600 text-white rounded px-3 py-2"
                  >
                    {hoverEffects.map(effect => (
                      <option key={effect.value} value={effect.value}>{effect.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white">Animation</Label>
                  <select
                    value={value.animation}
                    onChange={(e) => updateStyle('animation', e.target.value)}
                    className="w-full bg-gray-700 border-gray-600 text-white rounded px-3 py-2"
                  >
                    {animations.map(anim => (
                      <option key={anim.value} value={anim.value}>{anim.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Shadow Intensity</Label>
                  <Input
                    type="range"
                    min="0"
                    max="50"
                    value={value.shadowIntensity}
                    onChange={(e) => updateStyle('shadowIntensity', parseInt(e.target.value))}
                    className="bg-gray-700 border-gray-600"
                  />
                  <span className="text-gray-400 text-sm">{value.shadowIntensity}px</span>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white">Shadow Color</Label>
                  <Input
                    type="color"
                    value={value.shadowColor}
                    onChange={(e) => updateStyle('shadowColor', e.target.value)}
                    className="w-full h-10 bg-gray-700 border-gray-600"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white">Opacity</Label>
                  <Input
                    type="range"
                    min="10"
                    max="100"
                    value={value.opacity}
                    onChange={(e) => updateStyle('opacity', parseInt(e.target.value))}
                    className="bg-gray-700 border-gray-600"
                  />
                  <span className="text-gray-400 text-sm">{value.opacity}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideDown {
          from { transform: translateY(-30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes zoomIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
