'use server';

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface ContactFormResult {
  success: boolean;
  message: string;
}

export async function submitContactForm(data: ContactFormData): Promise<ContactFormResult> {
  // Validate required fields
  if (!data.name || !data.email || !data.message) {
    return {
      success: false,
      message: 'Please fill in all required fields.',
    };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return {
      success: false,
      message: 'Please enter a valid email address.',
    };
  }

  try {
    // In production, you would send an email or save to a database here
    // For now, we log the submission (server-side only)
    console.log('Contact form submission:', {
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      timestamp: new Date().toISOString(),
    });

    // Simulate a small delay for realistic UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      message: 'Thank you! Your message has been sent successfully.',
    };
  } catch (error) {
    console.error('Contact form error:', error);
    return {
      success: false,
      message: 'Something went wrong. Please try again later.',
    };
  }
}
