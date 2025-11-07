// app/api/agents/[id]/dependencies/route.js

import { NextResponse } from 'next/server'
import { dbServer } from '../../../../lib/supabase/dbServer'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      )
    }

    const dependencies = await dbServer.getAgentDependencies(id)

    return NextResponse.json(dependencies)
  } catch (error) {
    console.error('Failed to fetch dependencies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agent dependencies' },
      { status: 500 }
    )
  }
}