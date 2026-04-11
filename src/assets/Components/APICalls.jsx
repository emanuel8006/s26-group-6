const API_BASE = import.meta.env.VITE_API_URL

function authHeader() {
    const token = localStorage.getItem('oasis_token')
    return token ? { 'Authorization': token } : {}
}

export async function responseCheck({ response }) {
    if (!response.ok) {
        const errorData = await response.json();
        const detail = errorData.detail;
        alert(typeof detail === 'string' ? detail : JSON.stringify(detail));
    };
};

export async function login({ email, password }) {
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: email,
            password: password,
            full_name: null,
            username: null
        })
    });
    responseCheck({response})
    return response;
};

export async function register({ email, password, fullName, username }) {
    const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: email,
            password: password,
            full_name: fullName,
            username: username
        })
    });
    responseCheck({response})
    return response;
};

export async function updateMealPlan({
    planName = null,
    swipesStart = null,
    diningDollarsStart = null,
    startDate = null,
    endDate = null,
    swipesCurrent = null,
    diningDollarsCurrent = null,
    swipesPerWeek = null,
    dollarsPerWeek = null,
    offdays = null,
    dietaryPreferences = null,
    dietaryRestrictions = null }) {
    const response = await fetch(`${API_BASE}/user/update_meal_plan` , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
            plan_name: planName,
            swipes_start: swipesStart,
            dining_dollars_start: diningDollarsStart,
            start_date: startDate,
            end_date: endDate,
            swipes_current: swipesCurrent,
            dining_dollars_current: diningDollarsCurrent,
            swipes_per_week: swipesPerWeek,
            dollars_per_week: dollarsPerWeek,
            offdays: offdays,
            dietary_preferences: dietaryPreferences,
            dietary_restrictions: dietaryRestrictions,
        })
    });
    await responseCheck({response})
    return response;
};

export async function updateUserInfo({
    username = null,
    email = null,
}) {
    const body = {};
    if (username) body.username = username;
    if (email) body.email = email;
    if (!Object.keys(body).length) return null;  // nothing to update, skip the call
    const response = await fetch(`${API_BASE}/user/update_user_info`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(body),
    });
    await responseCheck({response})
    return response;
};

export async function getData({ columnList, tableName }) {
    const params = new URLSearchParams();
    columnList.forEach(col => params.append('column_list', col));
    params.append('table_name', tableName);
    const response = await fetch(`${API_BASE}/user/get_data?${params.toString()}`, {
        method: 'GET',
        headers: authHeader(),
    });
    if (!response.ok) return response;  // let caller handle, don't consume body
    return response;
};
