// /components/PrivacySettings.tsx
// Privacy & Data Settings Component - CR AudioViz AI
// User-facing consent management and data rights

'use client';

import React, { useState } from 'react';
import { useGovernance, ConsentType, RequestType, CONSENT_GROUPS, CONSENT_LABELS, REQUEST_LABELS } from '@/hooks/useGovernance';

// =============================================================================
// TYPES
// =============================================================================

interface PrivacySettingsProps {
  userId: string;
  userEmail?: string;
  onConsentChange?: (type: ConsentType, granted: boolean) => void;
  onDataRequest?: (type: RequestType) => void;
  showDataRequests?: boolean;
  showExport?: boolean;
  compact?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function PrivacySettings({
  userId,
  userEmail,
  onConsentChange,
  onDataRequest,
  showDataRequests = true,
  showExport = true,
  compact = false
}: PrivacySettingsProps) {
  const {
    consents,
    requests,
    loading,
    error,
    updateConsent,
    getConsentStatus,
    createDataRequest,
    exportMyData,
    consentGroups,
    consentLabels,
    requestLabels
  } = useGovernance({ userId });

  const [activeTab, setActiveTab] = useState<'consents' | 'requests' | 'export'>('consents');
  const [processingRequest, setProcessingRequest] = useState(false);

  // Handle consent toggle
  const handleConsentToggle = async (type: ConsentType) => {
    const newValue = !getConsentStatus(type);
    const success = await updateConsent(type, newValue);
    if (success && onConsentChange) {
      onConsentChange(type, newValue);
    }
  };

  // Handle data request
  const handleDataRequest = async (type: RequestType) => {
    setProcessingRequest(true);
    const request = await createDataRequest(type, userEmail);
    setProcessingRequest(false);
    
    if (request && onDataRequest) {
      onDataRequest(type);
    }
  };

  // Handle export
  const handleExport = async () => {
    await exportMyData();
  };

  if (loading && consents.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg shadow ${compact ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Privacy & Data Settings
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Control how we use your data and manage your privacy preferences
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('consents')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'consents'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Consent Preferences
        </button>
        {showDataRequests && (
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'requests'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Data Requests
          </button>
        )}
        {showExport && (
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'export'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Export Data
          </button>
        )}
      </div>

      {/* Consent Preferences Tab */}
      {activeTab === 'consents' && (
        <div className="space-y-6">
          {consentGroups.map((group) => (
            <div key={group.title} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="mb-3">
                <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  {group.title}
                  {group.required && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                      Required
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{group.description}</p>
              </div>
              
              <div className="space-y-3">
                {group.consents.map((consentType) => {
                  const label = consentLabels[consentType];
                  const isGranted = getConsentStatus(consentType);
                  const isRequired = group.required;
                  
                  return (
                    <div 
                      key={consentType}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {label.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {label.description}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => !isRequired && handleConsentToggle(consentType)}
                        disabled={isRequired || loading}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isGranted 
                            ? 'bg-blue-600' 
                            : 'bg-gray-200 dark:bg-gray-700'
                        } ${isRequired ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isGranted ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Data Requests Tab */}
      {activeTab === 'requests' && showDataRequests && (
        <div className="space-y-6">
          {/* Request Types */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">
              Submit a Data Request
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(Object.entries(requestLabels) as [RequestType, typeof requestLabels[RequestType]][]).map(
                ([type, label]) => (
                  <button
                    key={type}
                    onClick={() => handleDataRequest(type)}
                    disabled={processingRequest}
                    className="text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {label.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {label.description}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {label.regulation}
                    </p>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Previous Requests */}
          {requests.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                Your Requests
              </h3>
              <div className="space-y-2">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {requestLabels[request.request_type as RequestType]?.label || request.request_type}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        request.status === 'completed'
                          ? 'bg-cyan-500 text-cyan-500 dark:bg-cyan-500/30 dark:text-cyan-500'
                          : request.status === 'rejected'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-cyan-400 text-cyan-400 dark:bg-cyan-400/30 dark:text-cyan-400'
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && showExport && (
        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Download Your Data
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
              Download a copy of all the data we have about you in a machine-readable JSON format.
              This includes your profile, activity history, purchases, and more.
            </p>
            <button
              onClick={handleExport}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Preparing Export...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download My Data
                </>
              )}
            </button>
          </div>

          {/* Data Categories */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              What's Included in Your Export
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: '👤', label: 'Profile' },
                { icon: '📊', label: 'Activity' },
                { icon: '💬', label: 'Chat History' },
                { icon: '💳', label: 'Transactions' },
                { icon: '🛒', label: 'Orders' },
                { icon: '⭐', label: 'Reviews' },
                { icon: '✅', label: 'Consents' },
                { icon: '📝', label: 'Reports' }
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <span>{item.icon}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Your privacy is important to us. For questions, contact{' '}
          <a href="mailto:privacy@craudiovizai.com" className="text-blue-600 hover:underline">
            privacy@craudiovizai.com
          </a>
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// COOKIE BANNER COMPONENT
// =============================================================================

interface CookieBannerProps {
  userId?: string;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onCustomize: () => void;
}

export function CookieBanner({ userId, onAcceptAll, onRejectAll, onCustomize }: CookieBannerProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">
                Learn more
              </a>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                onRejectAll();
                setVisible(false);
              }}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Reject All
            </button>
            <button
              onClick={onCustomize}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Customize
            </button>
            <button
              onClick={() => {
                onAcceptAll();
                setVisible(false);
              }}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export default PrivacySettings;
