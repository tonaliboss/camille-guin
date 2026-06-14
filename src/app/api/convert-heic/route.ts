import { NextRequest, NextResponse } from 'next/server'
import convert from 'heic-convert'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const inputBuffer = Buffer.from(await file.arrayBuffer())
    const outputBuffer = await convert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 0.9,
    })

    return new NextResponse(new Uint8Array(outputBuffer), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="converted.jpg"`,
      },
    })
  } catch (err) {
    console.error('HEIC server conversion failed:', err)
    return NextResponse.json({ error: 'Conversion failed' }, { status: 500 })
  }
}