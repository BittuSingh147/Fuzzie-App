import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  // Verify Clerk webhook secret
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!SIGNING_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET')
    return new NextResponse('Missing webhook secret', { status: 500 })
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET)

  // Get headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // Validate headers
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Missing Svix headers', { status: 400 })
  }

  // Get and verify payload
  let evt: WebhookEvent
  try {
    const payload = await req.json()
    const body = JSON.stringify(payload)

    // Verify webhook
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent

    // Log event details
    console.log(`Received webhook with ID ${evt.data.id} and type ${evt.type}`)
    console.log('Full Webhook Payload:', JSON.stringify(evt, null, 2))

    // Handle specific user-related events
    if (evt.type === 'user.created' || evt.type === 'user.updated') {
      const { id, email_addresses, first_name, image_url } = evt.data

      // Ensure we have required data
      if (!id) {
        console.error('No user ID in webhook payload')
        return new NextResponse('Invalid user data', { status: 400 })
      }

      const email = email_addresses?.[0]?.email_address
      
      // Upsert user in database
      await db.user.upsert({
        where: { clerkId: id },
        update: {
          email: email || undefined,
          name: first_name || undefined,
          profileImage: image_url || undefined,
        },
        create: {
          clerkId: id,
          email: email || '',
          name: first_name || '',
          profileImage: image_url || '',
        },
      })

      console.log(`User ${id} synced to database`)
    }

    return new NextResponse('Webhook processed successfully', { status: 200 })
  } catch (error) {
    // Comprehensive error logging
    console.error('Webhook Verification or Processing Error:', error)
    return new NextResponse('Error processing webhook', { status: 500 })
  }
}