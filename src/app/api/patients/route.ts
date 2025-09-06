import { NextRequest, NextResponse } from 'next/server';
import { getPatientsPaginated } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || undefined;

    console.log('API Request:', { page, limit, search });

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    const result = await getPatientsPaginated({ page, limit, search });
    console.log('API Response:', { 
      total: result.pagination.total, 
      pageCount: result.pagination.totalPages,
      dataLength: result.data.length 
    });
    
    // Add caching headers for better performance
    const response = NextResponse.json(result);
    response.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59');
    
    return response;
  } catch (error) {
    console.error('Error in patients API:', error);
    
    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error details:', { errorMessage, errorStack });
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}
