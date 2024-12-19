export const devConfig = {
  sdkKey: process.env.REACT_APP_ZOOM_SDK_KEY || '',
  sdkSecret: process.env.REACT_APP_ZOOM_SDK_SECRET || '',
  topic: 'Real Estate Consultation',
  name: process.env.REACT_APP_USER_NAME || 'Agent',
  password: process.env.REACT_APP_MEETING_PASSWORD || '',
  sessionKey: '',
  userIdentity: '',
  // Add any other configuration needed for development environment
  signature: '',
  meetingNumber: process.env.REACT_APP_MEETING_NUMBER || ''
};
