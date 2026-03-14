import React from 'react';
import { GraduationCap, Smartphone } from 'lucide-react';

const AppFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-10 lg:px-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <div>
          <div className="mb-4 flex items-center gap-2 text-primary-900">
            <GraduationCap size={18} />
            <span className="text-xl font-bold">EduSphere</span>
          </div>
          <p className="text-sm text-slate-500">
            The premier learning platform for Sri Lankan university students. Connect with top tutors
            and peer sessions.
          </p>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">Platform</h4>
          <ul className="flex flex-col gap-2 text-sm text-slate-600">
            <li><a href="#" className="transition hover:text-primary-900">Course Catalog</a></li>
            <li><a href="#" className="transition hover:text-primary-900">Kuppi Sessions</a></li>
            <li><a href="#" className="transition hover:text-primary-900">Become a Tutor</a></li>
            <li><a href="#" className="transition hover:text-primary-900">Pricing Plans</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">Resources</h4>
          <ul className="flex flex-col gap-2 text-sm text-slate-600">
            <li><a href="#" className="transition hover:text-primary-900">Student Handbook</a></li>
            <li><a href="#" className="transition hover:text-primary-900">Faculty Support</a></li>
            <li><a href="#" className="transition hover:text-primary-900">Help Center</a></li>
            <li><a href="#" className="transition hover:text-primary-900">Blog</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">Download App</h4>
          <div className="flex flex-col gap-3">
            <div className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 p-3 text-white">
              <Smartphone size={20} />
              <div>
                <p className="text-[10px] uppercase leading-none">Get it on</p>
                <p className="text-sm font-bold">Google Play</p>
              </div>
            </div>
            <div className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 p-3 text-white">
              <Smartphone size={20} />
              <div>
                <p className="text-[10px] uppercase leading-none">Download on</p>
                <p className="text-sm font-bold">App Store</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs text-slate-400 md:flex-row">
        <p>(c) 2026 EduSphere Learning Hub. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="transition hover:text-primary-900">Privacy Policy</a>
          <a href="#" className="transition hover:text-primary-900">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
