'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Palette, 
  Plus, 
  Minus, 
  RotateCcw, 
  Copy, 
  Check,
  Shuffle,
  Save,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

interface GradientCustomizerProps {
  value: string;
  onChange: (gradient: string) => void;
  className?: string;
}

const presetGradients = [
  { name: 'Ocean Blue', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Sunset', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Forest', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Purple Rain', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { name: 'Fire', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
  { name: 'Galaxy', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' },
  { name: 'Emerald', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { name: 'Rose Gold', gradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)' },
  { name: 'Midnight', gradient: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
  { name: 'Aurora', gradient: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)' }
];

const gradientTypes = [
  { name: 'Linear', value: 'linear-gradient' },
  { name: 'Radial', value: 'radial-gradient' },
  { name: 'Conic', value: 'conic-gradient' }
];

const directions = [
  { name: 'To Right', value: 'to right' },
  { name: 'To Left', value: 'to left' },
  { name: 'To Bottom', value: 'to bottom' },
  { name: 'To Top', value: 'to top' },
  { name: 'To Bottom Right', value: 'to bottom right' },
  { name: 'To Bottom Left', value: 'to bottom left' },
  { name: 'To Top Right', value: 'to top right' },
  { name: 'To Top Left', value: 'to top left' },
  { name: '45deg', value: '45deg' },
  { name: '90deg', value: '90deg' },
  { name: '135deg', value: '135deg' },
  { name: '180deg', value: '180deg' }
];

export default function GradientCustomizer({ value, onChange, className = "" }: GradientCustomizerProps) {
  const [gradientType, setGradientType] = useState('linear-gradient');
  const [direction, setDirection] = useState('135deg');
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { id: '1', color: '#3B82F6', position: 0 },
    { id: '2', color: '#8B5CF6', position: 100 }
  ]);
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const generateGradient = () => {
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
    const stopsString = sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
    
    if (gradientType === 'radial-gradient') {
      return `radial-gradient(circle, ${stopsString})`;
    } else if (gradientType === 'conic-gradient') {
      return `conic-gradient(from 0deg, ${stopsString})`;
    } else {
      return `linear-gradient(${direction}, ${stopsString})`;
    }
  };

  const currentGradient = generateGradient();

  useEffect(() => {
    onChange(currentGradient);
  }, [gradientType, direction, colorStops, onChange, currentGradient]);

  const addColorStop = () => {
    const newPosition = colorStops.length > 0 ? 
      Math.max(...colorStops.map(s => s.position)) + 20 : 50;
    
    const newStop: ColorStop = {
      id: Date.now().toString(),
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      position: Math.min(newPosition, 100)
    };
    
    setColorStops([...colorStops, newStop]);
  };

  const removeColorStop = (id: string) => {
    if (colorStops.length > 2) {
      setColorStops(colorStops.filter(stop => stop.id !== id));
    }
  };

  const updateColorStop = (id: string, field: 'color' | 'position', value: string | number) => {
    setColorStops(colorStops.map(stop => 
      stop.id === id ? { ...stop, [field]: value } : stop
    ));
  };

  const applyPreset = (preset: string) => {
    // Parse preset gradient to extract colors
    const colorMatches = preset.match(/#[0-9a-fA-F]{6}|rgb\([^)]+\)|rgba\([^)]+\)/g);
    if (colorMatches && colorMatches.length >= 2) {
      const newStops: ColorStop[] = colorMatches.map((color, index) => ({
        id: (index + 1).toString(),
        color,
        position: (index / (colorMatches.length - 1)) * 100
      }));
      setColorStops(newStops);
    }
    
    // Extract gradient type and direction
    if (preset.includes('radial-gradient')) {
      setGradientType('radial-gradient');
    } else if (preset.includes('conic-gradient')) {
      setGradientType('conic-gradient');
    } else {
      setGradientType('linear-gradient');
      const directionMatch = preset.match(/linear-gradient\(([^,]+),/);
      if (directionMatch) {
        setDirection(directionMatch[1].trim());
      }
    }
  };

  const randomizeGradient = () => {
    const randomColors = Array.from({ length: Math.floor(Math.random() * 3) + 2 }, (_, i) => ({
      id: (i + 1).toString(),
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      position: (i / (Math.floor(Math.random() * 3) + 1)) * 100
    }));
    setColorStops(randomColors);
  };

  const copyGradient = async () => {
    try {
      await navigator.clipboard.writeText(currentGradient);
      setCopied(true);
      toast.success('Gradient copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy gradient');
    }
  };

  const resetGradient = () => {
    setGradientType('linear-gradient');
    setDirection('135deg');
    setColorStops([
      { id: '1', color: '#3B82F6', position: 0 },
      { id: '2', color: '#8B5CF6', position: 100 }
    ]);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Preview */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Palette className="h-5 w-5 text-blue-400" />
              Gradient Preview
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
          <div 
            className="w-full h-32 rounded-lg border border-gray-600 mb-4"
            style={{ background: currentGradient }}
          />
          <div className="flex gap-2">
            <Input
              value={currentGradient}
              readOnly
              className="bg-gray-700 border-gray-600 text-white font-mono text-sm"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={copyGradient}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
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
              onClick={randomizeGradient}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Random
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={resetGradient}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Gradient Type & Direction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Gradient Type</Label>
              <select
                value={gradientType}
                onChange={(e) => setGradientType(e.target.value)}
                className="w-full bg-gray-700 border-gray-600 text-white rounded px-3 py-2"
              >
                {gradientTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.name}</option>
                ))}
              </select>
            </div>
            
            {gradientType === 'linear-gradient' && (
              <div className="space-y-2">
                <Label className="text-white">Direction</Label>
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  className="w-full bg-gray-700 border-gray-600 text-white rounded px-3 py-2"
                >
                  {directions.map(dir => (
                    <option key={dir.value} value={dir.value}>{dir.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Color Stops */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Color Stops</CardTitle>
                <Button
                  size="sm"
                  onClick={addColorStop}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Color
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {colorStops.map((stop, index) => (
                <div key={stop.id} className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border border-gray-600"
                      style={{ backgroundColor: stop.color }}
                    />
                    <Input
                      type="color"
                      value={stop.color}
                      onChange={(e) => updateColorStop(stop.id, 'color', e.target.value)}
                      className="w-16 h-8 p-0 border-0 bg-transparent"
                    />
                  </div>
                  
                  <Input
                    value={stop.color}
                    onChange={(e) => updateColorStop(stop.id, 'color', e.target.value)}
                    className="flex-1 bg-gray-700 border-gray-600 text-white"
                    placeholder="#000000"
                  />
                  
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={stop.position}
                      onChange={(e) => updateColorStop(stop.id, 'position', parseInt(e.target.value))}
                      className="w-20 bg-gray-700 border-gray-600 text-white"
                    />
                    <span className="text-gray-400">%</span>
                  </div>
                  
                  {colorStops.length > 2 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeColorStop(stop.id)}
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Preset Gradients */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Preset Gradients</CardTitle>
              <CardDescription>Click any preset to apply it instantly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {presetGradients.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset.gradient)}
                    className="group relative h-16 rounded-lg border border-gray-600 hover:border-blue-500 transition-all duration-200 overflow-hidden"
                    style={{ background: preset.gradient }}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                    <div className="absolute bottom-1 left-1 right-1 text-xs text-white bg-black/50 rounded px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {preset.name}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
