export type ContactForm = { name: string; email: string; phone: string; type: string; message: string };
export type ContactErrors = Partial<Record<keyof ContactForm, string>>;

export function validateContact(form: ContactForm): ContactErrors {
  const errors: ContactErrors = {};
  const name = form.name.trim();
  const phone = form.phone.trim();
  const digits = phone.replace(/\D/g, '');
  if (name.length < 2 || name.length > 100 || !/\p{L}/u.test(name) || /[\r\n\0]/.test(name)) {
    errors.name = 'Enter your name (2–100 characters).';
  }
  if (phone.length > 30 || !/^\+?[\d ()-]+$/.test(phone) || /^(\d)\1+$/.test(digits) ||
      (phone.startsWith('+') ? digits.length < 8 || digits.length > 15 : digits.length !== 10) ||
      (phone.startsWith('+91') && digits.length !== 12)) {
    errors.phone = 'Enter a 10-digit phone number, or include + and your country code.';
  }
  if (form.email.length > 254 || !/^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(form.email.trim()) || /[\r\n\0]/.test(form.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!['Become a Distributor', 'Become a Retailer', 'B2B / Institutional', 'General Consumer Feedback'].includes(form.type)) {
    errors.type = 'Choose an enquiry purpose.';
  }
  if (form.message.length > 5000 || /\0/.test(form.message)) errors.message = 'Use up to 5,000 characters without null characters.';
  return errors;
}
