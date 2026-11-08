const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Failed to fetch health status');
  return res.json();
}

export async function fetchMenu(params = {}) {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'All') query.append('category', params.category);
  if (params.dietary && params.dietary !== 'All') query.append('dietary', params.dietary);
  if (params.search) query.append('search', params.search);
  
  const res = await fetch(`${API_BASE}/menu?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch menu items');
  return res.json();
}

export async function sendChatMessage(message, conversationHistory = [], userPreferences = null) {
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      conversation_history: conversationHistory,
      user_preferences: userPreferences
    })
  });
  if (!res.ok) throw new Error('Gemini concierge request failed');
  return res.json();
}

export async function fetchPreferences(customerId) {
  const res = await fetch(`${API_BASE}/preferences/${customerId}`);
  if (!res.ok) throw new Error('Failed to fetch user preferences');
  return res.json();
}

export async function savePreferences(prefData) {
  const res = await fetch(`${API_BASE}/preferences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prefData)
  });
  if (!res.ok) throw new Error('Failed to save user preferences');
  return res.json();
}

export async function createOrder(orderPayload) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...orderPayload,
      confirmed: true // explicit confirmation requirement
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to place order');
  }
  return res.json();
}

export async function fetchOrders(status = null) {
  const query = status && status !== 'all' ? `?status=${status}` : '';
  const res = await fetch(`${API_BASE}/orders${query}`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function fetchOrderById(identifier) {
  const res = await fetch(`${API_BASE}/orders/${identifier}`);
  if (!res.ok) throw new Error('Order not found');
  return res.json();
}

export async function updateOrderStatus(orderId, status) {
  const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update order status');
  return res.json();
}

export async function fetchCafeStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch café stats');
  return res.json();
}

export async function submitFeedback(feedbackData) {
  const res = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(feedbackData)
  });
  if (!res.ok) throw new Error('Failed to submit feedback');
  return res.json();
}

export async function fetchFeedbackAnalysis() {
  const res = await fetch(`${API_BASE}/ai/feedback-summary`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to generate feedback summary');
  return res.json();
}

export async function fetchOperationalInsights() {
  const res = await fetch(`${API_BASE}/ai/operational-insights`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to generate operational insights');
  return res.json();
}
