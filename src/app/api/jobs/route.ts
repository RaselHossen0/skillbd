import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      requirements,
      location,
      salary_range,
      deadline,
      employer_id,
      status,
    } = body;

    // Validate required fields
    if (!title || !description || !employer_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the job
    const job = await prisma.job.create({
      data: {
        title,
        description,
        requirements,
        location,
        salary_range,
        deadline: deadline ? new Date(deadline) : undefined,
        employer_id,
        status: status || 'ACTIVE',
      },
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employerId = searchParams.get('employerId');
    const status = searchParams.get('status');

    // Build the where clause
    const where: any = {};
    if (employerId) {
      where.employer_id = employerId;
    }
    if (status) {
      where.status = status;
    }

    // Fetch jobs
    const jobs = await prisma.job.findMany({
      where,
      include: {
        employer: {
          select: {
            company_name: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Transform the response to include applications count
    const transformedJobs = jobs.map(job => ({
      ...job,
      applications_count: job._count.applications,
      company_name: job.employer.company_name,
    }));

    return NextResponse.json(transformedJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
} 