import React from 'react';
import Layout from '../components/layout/Layout';
import MfaSettings from '../components/auth/MfaSettings';

export default function SettingsPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
        
        <div className="space-y-6">
          <section>
            <MfaSettings />
          </section>
          

        </div>
      </div>
    </Layout>
  );
}
