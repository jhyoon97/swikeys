import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { submitSwitch } from '@/lib/notion/switches';
import type { SubmitSwitchData } from '@/types/switch';

export const POST = async (request: NextRequest) => {
  try {
    const data: SubmitSwitchData = await request.json();

    if (!data.name || data.name.trim().length === 0) {
      return NextResponse.json({ error: 'Switch name is required' }, { status: 400 });
    }

    const pageId = await submitSwitch(data);
    return NextResponse.json({ id: pageId, success: true });
  } catch (error) {
    console.error('Failed to submit switch:', error);
    return NextResponse.json({ error: 'Failed to submit switch' }, { status: 500 });
  }
};
