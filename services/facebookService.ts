import { FacebookPage, FacebookUploadResponse, FacebookUser } from "../types";

// NOTE: Replace 'YOUR_FACEBOOK_APP_ID' with your actual App ID from developers.facebook.com
// You can also set this via environment variable REACT_APP_FACEBOOK_APP_ID or VITE_FACEBOOK_APP_ID depending on your bundler.
const FB_APP_ID = process.env.FB_APP_ID || 'YOUR_FACEBOOK_APP_ID'; 

export const initFacebookSdk = (): Promise<void> => {
  return new Promise((resolve) => {
    if ((window as any).FB) {
      resolve();
      return;
    }

    (window as any).fbAsyncInit = function() {
      (window as any).FB.init({
        appId      : FB_APP_ID,
        cookie     : true,
        xfbml      : true,
        version    : 'v18.0'
      });
      resolve();
    };

    // Load SDK asynchronously
    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s); js.id = id;
       (js as any).src = "https://connect.facebook.net/en_US/sdk.js";
       (fjs as any).parentNode.insertBefore(js, fjs);
     }(document, 'script', 'facebook-jssdk'));
  });
};

export const loginWithFacebook = (): Promise<FacebookUser> => {
  return new Promise((resolve, reject) => {
    if (!(window as any).FB) {
        reject(new Error("Facebook SDK not loaded."));
        return;
    }

    // Facebook requires HTTPS. Warn if likely to fail.
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        console.warn("Facebook Login requires HTTPS. This call may fail.");
    }

    try {
        (window as any).FB.login((response: any) => {
          if (response.authResponse) {
            (window as any).FB.api('/me', { fields: 'name, email, picture' }, (userInfo: any) => {
              if (!userInfo || userInfo.error) {
                reject(new Error("Failed to fetch user profile."));
              } else {
                resolve(userInfo as FacebookUser);
              }
            });
          } else {
            // User cancelled or error
            reject(new Error('Login cancelled or failed. Check console/network logs.'));
          }
        }, { scope: 'public_profile,pages_show_list,pages_manage_posts,pages_read_engagement' });
    } catch (e) {
        console.error("FB Login Call Failed", e);
        reject(new Error("Facebook Login failed to initialize."));
    }
  });
};

export const getFacebookPages = (): Promise<FacebookPage[]> => {
  return new Promise((resolve, reject) => {
    if (!(window as any).FB) {
        reject(new Error("Facebook SDK not loaded."));
        return;
    }

    (window as any).FB.api('/me/accounts', (response: any) => {
      if (response && !response.error) {
        resolve(response.data as FacebookPage[]);
      } else {
        console.error("Facebook API Error", response?.error);
        reject(new Error(response?.error?.message || "Failed to fetch pages."));
      }
    });
  });
};

export const uploadPhotoToFacebook = async (
  pageId: string,
  accessToken: string,
  message: string,
  imageBlob: Blob
): Promise<FacebookUploadResponse> => {
  
  const url = `https://graph.facebook.com/${pageId}/photos`;

  const formData = new FormData();
  formData.append("source", imageBlob);
  formData.append("message", message);
  formData.append("access_token", accessToken);
  formData.append("published", "true"); 

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Facebook upload failed");
    }

    return data as FacebookUploadResponse;
  } catch (error) {
    console.error("Facebook API Error:", error);
    throw error;
  }
};

export const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
};