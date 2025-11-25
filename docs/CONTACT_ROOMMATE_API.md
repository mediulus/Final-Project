# Contact Roommate API Integration Guide

## Overview
The Contact Roommate feature allows users to send an email notification to the owner of a roommate posting when they're interested in connecting.

## Backend Implementation
The backend automatically:
1. Verifies the posting exists
2. Retrieves the posting owner's email and username
3. Sends an email notification using the `ROOMMATE_CONTACT_NOTIFICATION_TEMPLATE`
4. Returns a success response

## API Endpoint

### POST `/api/RoommatePosting/contact`

**Authentication:** Required (session-based)

**Request Body:**
```json
{
  "session": "string (user's session ID)",
  "postingId": "string (ID of the roommate posting)"
}
```

**Success Response:**
```json
{
  "status": "contact_sent"
}
```

**Error Response:**
```json
{
  "error": "string (error message)"
}
```

## Frontend Implementation

### Using Fetch API (Vanilla JS)

```javascript
async function contactRoommate(postingId) {
  const session = localStorage.getItem('session'); // or however you store the session
  
  try {
    const response = await fetch('http://localhost:8000/api/RoommatePosting/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: session,
        postingId: postingId
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Failed to send contact:', data.error);
      alert('Failed to send contact request');
      return false;
    }
    
    console.log('Contact sent successfully:', data);
    alert('Your interest has been sent to the posting owner!');
    return true;
    
  } catch (error) {
    console.error('Network error:', error);
    alert('Failed to send contact request');
    return false;
  }
}

// Usage example
const postingId = '12345'; // Get this from your posting card/detail view
contactRoommate(postingId);
```

### Using Axios (React/Vue)

```javascript
import axios from 'axios';

const contactRoommate = async (postingId) => {
  const session = localStorage.getItem('session');
  
  try {
    const response = await axios.post(
      'http://localhost:8000/api/RoommatePosting/contact',
      {
        session: session,
        postingId: postingId
      }
    );
    
    if (response.data.error) {
      console.error('Failed to send contact:', response.data.error);
      throw new Error(response.data.error);
    }
    
    console.log('Contact sent successfully:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('Error contacting roommate:', error);
    throw error;
  }
};

export default contactRoommate;
```

### React Component Example

```jsx
import React, { useState } from 'react';
import contactRoommate from './api/contactRoommate';

function RoommatePostingCard({ posting }) {
  const [loading, setLoading] = useState(false);
  const [contacted, setContacted] = useState(false);

  const handleContact = async () => {
    setLoading(true);
    try {
      await contactRoommate(posting._id);
      setContacted(true);
      alert('Your interest has been sent!');
    } catch (error) {
      alert('Failed to send contact request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="posting-card">
      <h3>{posting.city}</h3>
      <p>{posting.description}</p>
      <p>Age: {posting.age} | Gender: {posting.gender}</p>
      
      <button 
        onClick={handleContact}
        disabled={loading || contacted}
      >
        {contacted ? 'Interest Sent ✓' : loading ? 'Sending...' : 'I\'m Interested'}
      </button>
    </div>
  );
}

export default RoommatePostingCard;
```

### Vue Component Example

```vue
<template>
  <div class="posting-card">
    <h3>{{ posting.city }}</h3>
    <p>{{ posting.description }}</p>
    <p>Age: {{ posting.age }} | Gender: {{ posting.gender }}</p>
    
    <button 
      @click="handleContact"
      :disabled="loading || contacted"
    >
      {{ contacted ? 'Interest Sent ✓' : loading ? 'Sending...' : "I'm Interested" }}
    </button>
  </div>
</template>

<script>
import { ref } from 'vue';
import { contactRoommate } from '@/api/roommates';

export default {
  name: 'RoommatePostingCard',
  props: {
    posting: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const loading = ref(false);
    const contacted = ref(false);

    const handleContact = async () => {
      loading.value = true;
      try {
        await contactRoommate(props.posting._id);
        contacted.value = true;
        alert('Your interest has been sent!');
      } catch (error) {
        alert('Failed to send contact request. Please try again.');
      } finally {
        loading.value = false;
      }
    };

    return {
      loading,
      contacted,
      handleContact
    };
  }
};
</script>
```

## Email Template
The posting owner will receive an email with the following content:

**Subject:** "Someone is interested in your roommate posting!"

**Body:**
```
Hi {{name}},

Someone wants to connect about your roommate posting! 👋

You can view their message in your inbox and decide whether to connect.

— The DGH Team
```

## Notes
- The session must be valid and active
- The postingId must exist in the database
- The posting owner's email must be valid
- If `NOTIFICATIONS_DRY_RUN=true` (default), emails will be printed to console instead of sent
- Set `NOTIFICATIONS_DRY_RUN=false` in production to actually send emails

## Testing
1. Create a roommate posting as User A
2. Log in as User B
3. Call the contact endpoint with User A's posting ID
4. Check the server logs (dry-run mode) or User A's email inbox (production mode)

## Error Scenarios
- **Invalid session:** Returns `{ error: "Session not found" }`
- **Invalid postingId:** Returns `{ error: "Posting not found" }`
- **Missing required fields:** Returns `{ error: "Missing required field: X" }`
- **Email delivery failure:** Logged on backend, returns error to frontend
