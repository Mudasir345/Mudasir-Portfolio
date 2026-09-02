export function getContactEmail(): string {
  if (
    typeof process !== "undefined" &&
    process.env &&
    (process.env.CONTACT_EMAIL || process.env.EMAIL_USER)
  ) {
    return (process.env.CONTACT_EMAIL || process.env.EMAIL_USER) as string;
  }
  return "mudasirchoudhry345@gmail.com";
}

export const CONTACT_EMAIL = getContactEmail();

export const gmailComposeUrl = (subject = "Project Inquiry") =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT_EMAIL)}&su=${encodeURIComponent(subject)}`;
