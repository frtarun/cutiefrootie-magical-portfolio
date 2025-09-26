/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';

export const ContactPage: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setSubmitting(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get('name') || ''),
      email: String(formData.get('email') || ''),
      message: String(formData.get('message') || ''),
    };

    try {
      const API_BASE = (import.meta as any)?.env?.VITE_API_BASE_URL || 'http://localhost:4000';
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setNotice("Thank you for your message! I'll get back to you soon.");
        form.reset();
      } else {
        const data = await res.json().catch(() => null);
        setNotice(data?.errors?.[0]?.msg || 'Failed to send message. Please try again later.');
      }
    } catch (err) {
      setNotice('Unable to reach server. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <header className="text-center mb-10">
        <h1 className="font-display text-4xl font-extrabold text-slate-800">Let's Create Together!</h1>
        <p className="mt-4 text-lg text-slate-600">Want a customized magical site for your loved ones? Have a question? Let’s create something amazing together!</p>
      </header>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200/80">
        {notice && (
          <div className="mb-4 p-3 rounded bg-pink-50 text-slate-800 border border-pink-200">{notice}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name</label>
            <div className="mt-1">
              <input
                type="text"
                name="name"
                id="name"
                required
                className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                placeholder="Your Name"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-700">Message</label>
            <div className="mt-1">
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                placeholder="Tell me about the magical site you're dreaming of..."
              ></textarea>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={submitting}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 ${submitting ? 'bg-pink-300 cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600'}`}
            >
              {submitting ? 'Sending...' : 'Send Magical Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
