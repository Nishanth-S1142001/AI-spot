import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createFeedback } from '../../actions/agents'
import { supabaseAdmin } from '../../lib/supabase/dbServer'

export async function POST(req) {
  try {
    const formData = await req.formData()

    // --- Extract feedback data ---
    const feedback = {
      type: formData.get('type') || 'general',
      subject: formData.get('subject') || 'No Subject',
      message: formData.get('message') || '',
      rating: formData.get('rating') ? parseInt(formData.get('rating')) : null,
      email: formData.get('email') || null,
      userId: formData.get('userId') || null,
      userName: formData.get('userName') || 'Anonymous'
    }

    // --- Upload attachments to Supabase Storage ---
    const uploadedAttachments = []
    const MAX_SIZE = 5 * 1024 * 1024
    const ALLOWED_MIMES = [
      'image/png',
      'image/jpeg',
      'image/gif',
      'application/pdf'
    ]

    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file_') && value?.name) {
        if (value.size > MAX_SIZE) continue
        if (!ALLOWED_MIMES.includes(value.type)) continue

        const arrayBuffer = await value.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const filePath = `feedback/${Date.now()}-${value.name}`

        const { error } = await supabaseAdmin.storage
          .from('feedback-attachments')
          .upload(filePath, buffer, { contentType: value.type })

        if (!error) {
          const { data: publicUrlData } = supabaseAdmin.storage
            .from('feedback-attachments')
            .getPublicUrl(filePath)

          uploadedAttachments.push({
            name: value.name,
            type: value.type,
            size: value.size,
            url: publicUrlData.publicUrl
          })
        } else {
          console.error('Upload error:', error)
        }
      }
    }

    // --- Save feedback to Supabase table ---
    const savedFeedback = await createFeedback(feedback.userId, {
      name: feedback.userName,
      email: feedback.email,
      type: feedback.type,
      subject: feedback.subject,
      message: feedback.message,
      rating: feedback.rating,
      attachments: uploadedAttachments
    })

    // --- Send email notification ---
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.FEEDBACK_EMAIL_USER,
        pass: process.env.FEEDBACK_EMAIL_PASS
      }
    })

    const fileLinksHTML = uploadedAttachments
      .map(
        (f) =>
          `<li><a href="${f.url}" target="_blank">${f.name}</a> (${(
            f.size / 1024
          ).toFixed(1)} KB)</li>`
      )
      .join('')

    const htmlMessage = `
      <h2>📩 New Feedback Received</h2>
      <p><strong>From:</strong> ${feedback.userName} (${feedback.email || 'No Email'})</p>
      <p><strong>Type:</strong> ${feedback.type}</p>
      <p><strong>Subject:</strong> ${feedback.subject}</p>
      <p><strong>Rating:</strong> ${feedback.rating || 'N/A'}</p>
      <hr/>
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${escapeHtml(feedback.message)}</p>
      ${
        uploadedAttachments.length
          ? `<hr/><p><strong>Attachments:</strong></p><ul>${fileLinksHTML}</ul>`
          : ''
      }
      ${
        savedFeedback
          ? `<hr/><p style="color:gray;"><strong>Feedback ID:</strong> ${savedFeedback.id}</p>`
          : ''
      }
    `

    await transporter.sendMail({
      from: `"AgentBuilder Feedback" <${process.env.FEEDBACK_EMAIL_USER}>`,
      to: process.env.FEEDBACK_RECEIVER || process.env.FEEDBACK_EMAIL_USER,
      subject: `📢 Feedback: ${feedback.subject}`,
      html: htmlMessage
    })

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedbackId: savedFeedback?.id
    })
  } catch (error) {
    console.error('🔥 Feedback API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

// escape HTML for safety
function escapeHtml(str = '') {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
