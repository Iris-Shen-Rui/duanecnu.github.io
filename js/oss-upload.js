// OSS Upload Module for direct browser-to-OSS uploads
// This module would be integrated with Alibaba Cloud OSS STS token service in production

const ossUpload = {
  // In production, this would fetch STS token from backend
  async getSTSToken() {
    // Mock implementation - in production, call your Flask backend endpoint
    // Example: return fetch('/api/oss/sts-token').then(res => res.json());
    return {
      accessKeyId: 'MOCK_ACCESS_KEY',
      accessKeySecret: 'MOCK_SECRET',
      securityToken: 'MOCK_SECURITY_TOKEN',
      expiration: new Date(Date.now() + 3600 * 1000).toISOString(),
      bucket: 'duanmen-research',
      region: 'oss-cn-shanghai',
      dir: 'uploads/'
    };
  },
  
  // Generate OSS policy and signature (client-side for demo, server-side in production)
  generatePolicy(bucket, dir, expiration) {
    const policy = {
      expiration: expiration,
      conditions: [
        { bucket: bucket },
        ['starts-with', '$key', dir],
        { acl: 'private' },
        ['content-length-range', 0, 52428800] // 50MB max
      ]
    };
    
    return btoa(JSON.stringify(policy));
  },
  
  // Upload file directly to OSS
  async uploadFile(file, path) {
    try {
      // Get STS token
      const token = await this.getSTSToken();
      
      // Generate policy and signature
      const expiration = new Date(Date.now() + 3600 * 1000).toISOString();
      const policy = this.generatePolicy(token.bucket, token.dir, expiration);
      // In production, signature should be generated server-side for security
      const signature = 'MOCK_SIGNATURE'; 
      
      // Prepare form data
      const formData = new FormData();
      formData.append('key', `${token.dir}${path}`);
      formData.append('policy', policy);
      formData.append('OSSAccessKeyId', token.accessKeyId);
      formData.append('success_action_status', '200');
      formData.append('signature', signature);
      formData.append('file', file);
      
      // Upload to OSS
      const response = await fetch(`https://${token.bucket}.${token.region}.aliyuncs.com`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        return {
          success: true,
          url: `https://${token.bucket}.${token.region}.aliyuncs.com/${token.dir}${path}`
        };
      } else {
        throw new Error('OSS upload failed');
      }
    } catch (error) {
      console.error('OSS upload error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Batch upload multiple files
  async uploadFiles(files, prefix = 'meeting') {
    const results = [];
    const timestamp = Date.now();
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = `${prefix}/${timestamp}_${i}_${file.name}`;
      const result = await this.uploadFile(file, path);
      results.push({ file: file.name, ...result });
    }
    
    return results;
  }
};

// Export OSS module
window.ossUpload = ossUpload;

// Note: In production environment:
// 1. STS token generation MUST be done server-side (Flask backend)
// 2. Policy/signature generation MUST be done server-side
// 3. This client module should ONLY handle the actual upload after receiving signed policy
// 4. Never expose OSS secrets in frontend code
