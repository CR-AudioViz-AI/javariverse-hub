import { NextRequest, NextResponse } from 'next/server';

const CDN_DIGITAL_PRODUCTS = 'https://cdn.craudiovizai.com/digital-products/';

export async function GET(
  request: NextRequest,
  { params }: { params: { purchaseId: string } }
) {
  // Verify purchase, get filename
  const filename = 'example.zip'; // Get from database
  
  // Redirect to R2 CDN
  const cdnUrl = `${CDN_DIGITAL_PRODUCTS}${filename}`;
  
  return NextResponse.redirect(cdnUrl);
}
