import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight, Github, Twitter, Linkedin, Sun, Moon, Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuthStore, useAppStore } from '@/store';
import api from '@/services/api';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Footer } from '@/components/layout/Footer';

export const ContactPage: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { theme, toggleTheme } = useAppStore();

  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/contact', formData);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      <TopNavbar />

      {/* MAIN CONTACT SECTION */}
      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto px-6 py-12 gap-12 lg:gap-24 relative">
        
        {/* Left Side: Contact Info */}
        <div className="flex-1 space-y-8 py-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-heading tracking-tight mb-4">Get in touch</h1>
            <p className="text-lg text-muted font-medium leading-relaxed">
              Have questions about our Enterprise plans, custom integrations, or need technical support? Our team is here to help you.
            </p>
          </div>

          <div className="space-y-6 pt-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-heading">Email Us</h3>
                <p className="text-sm text-muted mb-1">We'll respond within 24 hours.</p>
                <a href="mailto:support@taskmaster.com" className="text-sm font-bold text-primary hover:underline">support@taskmaster.com</a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-heading">Call Us</h3>
                <p className="text-sm text-muted mb-1">Mon-Fri from 8am to 5pm.</p>
                <a href="tel:+18001234567" className="text-sm font-bold text-primary hover:underline">+1 (800) 123-4567</a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-heading">Office</h3>
                <p className="text-sm text-muted mb-1">Come say hello at our HQ.</p>
                <span className="text-sm font-semibold text-foreground">100 Innovation Drive<br/>San Francisco, CA 94103</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Contact Form */}
        <div className="flex-1 bg-surface border border-border rounded-2xl shadow-xl p-8 relative overflow-hidden">
          {/* Abstract glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
          
          <h3 className="text-2xl font-bold text-heading mb-6">Send us a message</h3>
          
          {success ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h4 className="text-xl font-bold text-heading mb-2">Message Sent!</h4>
              <p className="text-muted font-medium mb-6">Thank you for reaching out. Our team will get back to you shortly.</p>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-2.5 rounded-lg border border-border hover:bg-secondary text-sm font-bold transition-all"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg text-xs font-semibold">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-heading block mb-1.5">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Jane Doe"
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-heading block mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="jane@company.com"
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-heading block mb-1.5">Subject</label>
                <select
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer"
                >
                  <option value="" disabled>Select a topic...</option>
                  <option value="Enterprise Sales">Enterprise Sales & Pricing</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Partnerships">Partnerships</option>
                  <option value="Other">Other Inquiry</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-heading block mb-1.5">Message</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="How can we help you?"
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <><Send className="w-4 h-4" /> Send Message</>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
