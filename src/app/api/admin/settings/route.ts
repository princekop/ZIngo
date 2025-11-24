import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user || !(session.user as any)?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all settings from database
    const settings = await prisma.systemSetting.findMany();
    
    // Transform settings into structured format
    const structuredSettings = {
      general: {
        siteName: 'DarkByte',
        siteDescription: 'Premium Discord server management platform',
        adminEmail: 'admin@darkbyte.in',
        maintenanceMode: false,
        registrationEnabled: true
      },
      security: {
        twoFactorRequired: false,
        sessionTimeout: 24,
        maxLoginAttempts: 5,
        passwordMinLength: 8
      },
      email: {
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: '',
        fromEmail: 'noreply@darkbyte.in',
        fromName: 'DarkByte'
      },
      appearance: {
        primaryColor: '#3B82F6',
        secondaryColor: '#8B5CF6',
        darkMode: true,
        customCSS: ''
      },
      performance: {
        cacheEnabled: true,
        cacheDuration: 3600,
        compressionEnabled: true,
        cdnEnabled: false
      }
    };

    // Override with database values if they exist
    settings.forEach(setting => {
      const keys = setting.key.split('.');
      if (keys.length === 2) {
        const [section, field] = keys;
        if (structuredSettings[section as keyof typeof structuredSettings]) {
          (structuredSettings[section as keyof typeof structuredSettings] as any)[field] = 
            setting.value === 'true' ? true : 
            setting.value === 'false' ? false :
            isNaN(Number(setting.value)) ? setting.value : Number(setting.value);
        }
      }
    });

    return NextResponse.json(structuredSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}
