import { NextRequest, NextResponse } from 'next/server';

const CDN_DIGITAL_PRODUCTS = 'https://cdn.craudiovizai.com/digital-products/';

export async function POST(request: NextRequest) {
  const { productId } = await request.json();
  
  // Process purchase, record in database
  
  // Return CDN URL for download
  const filename = `product-${productId}.zip`;
  const downloadUrl = `${CDN_DIGITAL_PRODUCTS}${filename}`;
  
  return NextResponse.json({
    success: true,
    downloadUrl,
    message: 'Purchase complete - file available on R2 CDN'
  });
}
