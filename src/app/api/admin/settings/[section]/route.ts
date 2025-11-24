import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

type SettingsSectionParams = { section: string }

export async function PUT(
  request: NextRequest,
  context: { params: Promise<SettingsSectionParams> }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user || !(session.user as any)?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { section } = await context.params;
    const body = await request.json();

    // Validate section
    const validSections = ['general', 'security', 'email', 'appearance', 'performance'];
    if (!validSections.includes(section)) {
      return NextResponse.json(
        { error: 'Invalid section' },
        { status: 400 }
      );
    }

    // Save each setting to database
    const settingPromises = Object.entries(body).map(([key, value]) => {
      const settingKey = `${section}.${key}`;
      return prisma.systemSetting.upsert({
        where: { key: settingKey },
        update: { 
          value: String(value),
          updatedAt: new Date()
        },
        create: { 
          key: settingKey,
          value: String(value)
        }
      });
    });

    await Promise.all(settingPromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
