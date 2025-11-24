'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bot, 
  Sparkles, 
  Wand2, 
  Send, 
  Loader2,
  Lightbulb,
  Palette,
  Type,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface AIContentGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onContentGenerated: (content: {
    title: string;
    excerpt: string;
    content: string;
    cardStyle: any;
    tags: string[];
    category: string;
  }) => void;
}

interface GeneratedContent {
  title: string;
  excerpt: string;
  content: string;
  cardStyle: {
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
  };
  tags: string[];
  category: string;
}

const contentTemplates = [
  {
    name: "App Announcement",
    prompt: "Create a professional announcement for DarkByte, a Discord-like communication app with premium features",
    icon: "📱"
  },
  {
    name: "Feature Showcase",
    prompt: "Write about DarkByte's advanced server management and community building features",
    icon: "✨"
  },
  {
    name: "Tutorial Guide",
    prompt: "Create a comprehensive guide for getting started with DarkByte's premium tools",
    icon: "📚"
  },
  {
    name: "Community Update",
    prompt: "Write an engaging community update about DarkByte's growth and new features",
    icon: "🚀"
  }
];

export default function AIContentGenerator({ isOpen, onClose, onContentGenerated }: AIContentGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMagicEffect, setShowMagicEffect] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [currentStep, setCurrentStep] = useState('');

  const typeWriter = (text: string, callback?: () => void) => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setTypingText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
        if (callback) callback();
      }
    }, 30);
    return timer;
  };

  const generateContent = async (inputPrompt: string) => {
    setIsGenerating(true);
    setShowMagicEffect(true);
    setTypingText('');
    
    // Show magical generation steps
    const steps = [
      '🧠 Analyzing your prompt...',
      '✨ Generating creative ideas...',
      '📝 Crafting compelling content...',
      '🎨 Designing beautiful card styles...',
      '🏷️ Creating relevant tags...',
      '✅ Finalizing your blog post...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i]);
      setTypingText('');
      await new Promise<void>(resolve => {
        typeWriter(steps[i], () => resolve());
      });
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: inputPrompt,
          type: 'blog_post',
          context: 'DarkByte is a premium Discord-like communication platform with advanced server management, community building tools, and premium features for Discord communities.'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const generatedContent: GeneratedContent = await response.json();
      
      // Show completion with magic effect
      setCurrentStep('🎉 Content generated successfully!');
      setTypingText('');
      typeWriter('🎉 Content generated successfully!', () => {
        setTimeout(() => {
          onContentGenerated(generatedContent);
          setShowMagicEffect(false);
          toast.success('AI content applied to your blog post!');
        }, 1000);
      });
      
    } catch (error) {
      console.error('Error generating content:', error);
      setCurrentStep('❌ Generation failed. Using fallback content...');
      setTypingText('');
      typeWriter('❌ Generation failed. Using fallback content...', () => {
        setTimeout(() => {
          setShowMagicEffect(false);
          toast.error('Failed to generate content. Please try again.');
        }, 1500);
      });
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
      }, 2000);
    }
  };

  const handleTemplateSelect = (template: typeof contentTemplates[0]) => {
    setSelectedTemplate(template.name);
    setPrompt(template.prompt);
  };

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt or select a template');
      return;
    }
    generateContent(prompt);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Magic Effect Overlay */}
      {showMagicEffect && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center">
          <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 p-8 rounded-2xl border border-purple-500/30 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="h-10 w-10 text-white animate-spin" />
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full animate-ping"></div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">AI Magic in Progress</h3>
                <div className="h-16 flex items-center justify-center">
                  <p className="text-lg text-purple-200 font-medium min-h-[1.5rem]">
                    {typingText}
                    <span className="animate-pulse">|</span>
                  </p>
                </div>
              </div>
              
              <div className="flex justify-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`fixed left-0 top-0 h-full bg-gray-900/95 backdrop-blur-sm border-r border-gray-700 z-50 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-96'
      } overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">AI Content Generator</h2>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          {!isCollapsed && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-4 space-y-6 h-full overflow-y-auto">
          {/* Quick Templates */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                Quick Templates
              </CardTitle>
              <CardDescription>Choose a template to get started quickly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {contentTemplates.map((template) => (
                <Button
                  key={template.name}
                  variant={selectedTemplate === template.name ? "default" : "outline"}
                  className={`w-full justify-start text-left h-auto p-3 ${
                    selectedTemplate === template.name 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <span className="mr-2 text-lg">{template.icon}</span>
                  <div>
                    <div className="font-medium">{template.name}</div>
                    <div className="text-xs opacity-70 mt-1">{template.prompt.substring(0, 60)}...</div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Custom Prompt */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Type className="h-5 w-5 text-green-400" />
                Custom Prompt
              </CardTitle>
              <CardDescription>Describe what you want to create</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">What would you like to write about?</Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., We are announcing our DarkByte app, similar to Discord, with premium server management features..."
                  className="bg-gray-700 border-gray-600 text-white min-h-24"
                  rows={4}
                />
              </div>
              
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* AI Features */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                AI Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Automatic title and excerpt generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Rich content with proper formatting</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Custom card design generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>SEO-optimized tags and categories</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span>Bold text and color highlighting</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">💡 Pro Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs text-gray-400">
                <p>• Be specific about your app's features and benefits</p>
                <p>• Mention your target audience (Discord users, gamers, communities)</p>
                <p>• Include any special announcements or updates</p>
                <p>• The AI will automatically format and style your content</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isCollapsed && (
        <div className="p-2 space-y-4">
          <Button
            size="sm"
            variant="ghost"
            className="w-full p-2 text-blue-400 hover:bg-gray-800"
            onClick={() => setIsCollapsed(false)}
          >
            <Bot className="h-5 w-5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-full p-2 text-purple-400 hover:bg-gray-800"
            onClick={() => setIsCollapsed(false)}
          >
            <Sparkles className="h-5 w-5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-full p-2 text-green-400 hover:bg-gray-800"
            onClick={() => setIsCollapsed(false)}
          >
            <Wand2 className="h-5 w-5" />
          </Button>
        </div>
      )}
      
      <style jsx>{`
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        
        .scrollbar-thumb-purple-600 {
          scrollbar-color: #9333ea #1f2937;
        }
        
        .scrollbar-track-gray-800 {
          scrollbar-color: #9333ea #1f2937;
        }
        
        /* Webkit scrollbar styles */
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 4px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #9333ea, #7c3aed);
          border-radius: 4px;
          transition: all 0.3s ease;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #a855f7, #8b5cf6);
          box-shadow: 0 0 10px rgba(147, 51, 234, 0.5);
        }
        
        @media (max-width: 768px) {
          .scrollbar-thin::-webkit-scrollbar {
            width: 6px;
          }
        }
      `}</style>
    </div>
    </>
  );
}
