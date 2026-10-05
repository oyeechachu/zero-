'use client';

import { useState, type FormEvent } from 'react';

const projectTypes = [
  'Campaign production',
  'Film / cinematography',
  'Photography',
  'Creative direction',
  'Something else',
];

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const email = String(form.get('email') ?? '').trim();
    const type = String(form.get('project-type') ?? '').trim();
    const brief = String(form.get('brief') ?? '').trim();
    const subject = encodeURIComponent(`${type || 'New project enquiry'} — ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nProject: ${type}\n\n${brief}`);

    window.location.assign(`mailto:hello@zerodegree.studio?subject=${subject}&body=${body}`);
    setSubmitted(true);
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <label>
        <span>YOUR NAME</span>
        <input name="name" autoComplete="name" required />
      </label>
      <label>
        <span>EMAIL ADDRESS</span>
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        <span>WHAT ARE YOU THINKING?</span>
        <select name="project-type" defaultValue="" required>
          <option value="" disabled>Select a project type</option>
          {projectTypes.map((type) => <option key={type}>{type}</option>)}
        </select>
      </label>
      <label>
        <span>A LITTLE ABOUT IT</span>
        <textarea name="brief" rows={4} required />
      </label>
      <button type="submit" className="contact-submit">SEND THE BRIEF <span aria-hidden="true">↗</span></button>
      <p className="contact-form-status" aria-live="polite">
        {submitted ? 'Your email app should open with your brief ready to send. If it doesn’t, email hello@zerodegree.studio directly.' : 'Opens a new email with your details. No backend or third-party form service.'}
      </p>
    </form>
  );
}
