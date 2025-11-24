import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

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

const cardStyleTemplates = [
  {
    name: "DarkByte Premium",
    style: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: 16,
      borderWidth: 2,
      borderColor: '#3B82F6',
      shadowIntensity: 25,
      shadowColor: '#000000',
      titleColor: '#ffffff',
      textColor: '#e5e7eb',
      accentColor: '#60a5fa',
      hoverEffect: 'scale',
      animation: 'fadeIn',
      opacity: 95
    }
  },
  {
    name: "Discord Inspired",
    style: {
      background: 'linear-gradient(135deg, #5865f2 0%, #3c45a5 100%)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#5865f2',
      shadowIntensity: 20,
      shadowColor: '#5865f2',
      titleColor: '#ffffff',
      textColor: '#b9bbbe',
      accentColor: '#00d4aa',
      hoverEffect: 'lift',
      animation: 'slideUp',
      opacity: 90
    }
  },
  {
    name: "Gaming Theme",
    style: {
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
      borderRadius: 14,
      borderWidth: 2,
      borderColor: '#ff6b6b',
      shadowIntensity: 30,
      shadowColor: '#ff6b6b',
      titleColor: '#ffffff',
      textColor: '#f1f2f6',
      accentColor: '#feca57',
      hoverEffect: 'glow',
      animation: 'zoomIn',
      opacity: 92
    }
  }
];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { prompt, type, context } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Create a comprehensive system prompt for blog content generation
    const systemPrompt = `You are an expert content creator for DarkByte, a premium Discord-like communication platform. 

CONTEXT: ${context}

Your task is to generate high-quality blog content based on the user's prompt. You must respond with a JSON object containing:

1. title: A compelling, SEO-friendly title (max 60 characters)
2. excerpt: A brief, engaging summary (max 160 characters)
3. content: Rich HTML content with proper formatting, including:
   - Use <h2>, <h3> for headings
   - Use <p> for paragraphs with proper spacing
   - Use <strong> for important text (make it bold and colorful)
   - Use <em> for emphasis
   - Use <ul> and <li> for lists
   - Include relevant emojis where appropriate
   - Make the content engaging and professional
   - Focus on DarkByte's premium features and community benefits
4. tags: Array of 3-5 relevant tags
5. category: One category (Technology, Community, Features, Guides, or Updates)

IMPORTANT: Make the content visually appealing with proper HTML formatting, bold text for key points, and engaging language that highlights DarkByte's premium Discord-like features.

Example format:
{
  "title": "Introducing DarkByte: The Future of Discord Communities",
  "excerpt": "Discover how DarkByte revolutionizes Discord server management with premium tools and advanced community features.",
  "content": "<h2>🚀 Welcome to the Future of Community Management</h2><p>DarkByte represents a <strong>revolutionary leap forward</strong> in Discord server management...</p>",
  "tags": ["discord", "community", "premium", "features"],
  "category": "Technology"
}`;

    const userPrompt = `Create a blog post about: ${prompt}

Make sure to:
- Highlight DarkByte's premium features
- Use engaging, professional language
- Include proper HTML formatting with bold text for key points
- Make it relevant to Discord users and community managers
- Include emojis where appropriate
- Focus on benefits and value proposition`;

    // Call OpenRouter API with Grok
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://darkbyte.in',
        'X-Title': 'DarkByte Blog Generator'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const generatedText = aiResponse.choices[0]?.message?.content;

    if (!generatedText) {
      throw new Error('No content generated from AI');
    }

    // Parse the AI response
    let parsedContent;
    try {
      // Try to extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      // Fallback: create structured content from the raw text
      parsedContent = {
        title: "DarkByte: Premium Discord Experience",
        excerpt: "Discover the next generation of Discord server management with DarkByte's premium features.",
        content: `<h2>🚀 Introducing DarkByte</h2><p>${generatedText.replace(/\n/g, '</p><p>')}</p>`,
        tags: ["darkbyte", "discord", "premium", "community"],
        category: "Technology"
      };
    }

    // Select a random card style template
    const randomTemplate = cardStyleTemplates[Math.floor(Math.random() * cardStyleTemplates.length)];

    // Combine the generated content with a card style
    const finalContent: GeneratedContent = {
      title: parsedContent.title || "DarkByte: Premium Discord Experience",
      excerpt: parsedContent.excerpt || "Discover the next generation of Discord server management.",
      content: parsedContent.content || "<p>Content generated successfully!</p>",
      cardStyle: randomTemplate.style,
      tags: parsedContent.tags || ["darkbyte", "discord", "premium"],
      category: parsedContent.category || "Technology"
    };

    return NextResponse.json(finalContent);

  } catch (error) {
    console.error('Error generating AI content:', error);
    
    // Fallback content if AI fails
    const fallbackContent: GeneratedContent = {
      title: "DarkByte: The Future of Discord Communities",
      excerpt: "Discover how DarkByte revolutionizes Discord server management with premium tools and advanced features.",
      content: `
        <h2>🚀 Welcome to DarkByte</h2>
        <p>We're excited to announce <strong>DarkByte</strong>, a revolutionary platform that takes Discord server management to the next level.</p>
        
        <h3>✨ Premium Features</h3>
        <ul>
          <li><strong>Advanced Server Management</strong> - Complete control over your community</li>
          <li><strong>Premium Tools</strong> - Exclusive features for enhanced user experience</li>
          <li><strong>Community Building</strong> - Tools designed to grow and engage your audience</li>
          <li><strong>Professional Support</strong> - Dedicated assistance for your server needs</li>
        </ul>
        
        <h3>🎯 Why Choose DarkByte?</h3>
        <p>DarkByte combines the <strong>familiar Discord experience</strong> with powerful premium features that help you build and manage thriving communities.</p>
        
        <p>Join thousands of community managers who have already upgraded their Discord experience with DarkByte's premium tools.</p>
      `,
      cardStyle: cardStyleTemplates[0].style,
      tags: ["darkbyte", "discord", "premium", "community", "features"],
      category: "Technology"
    };

    return NextResponse.json(fallbackContent);
  }
}
