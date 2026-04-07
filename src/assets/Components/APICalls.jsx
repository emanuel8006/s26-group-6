export async function responseCheck({ response }) {
    if (!response.ok) {
        const errorData = await response.json();
        alert(`${errorData.detail}`);
    };
};

export async function login({ email, password }) {
    const response = await fetch('http://localhost:8000/auth/login', {
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
    const response = await fetch('http://localhost:8000/auth/register', {
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
    diningDollarsStart = null }) {
    const response = await fetch('http://localhost:8000/user/update_meal_plan' , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        plan_name: planName,
        swipes_start: swipesStart,
        dining_dollars_start: diningDollarsStart,
        })
    });
    responseCheck({response})
    return response;
};

export async function updateUserInfo({ 
    username = null, 
    email = null, 
    dietaryPreferences = null,
    dietaryRestrictions = null
}) {
    const response = await fetch('http://localhost:8000/user/update_meal_plan' , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: username,
            email: email,
            dietary_preferences: dietaryPreferences,
            diet_restrictions: dietaryRestrictions
        })
    });
    responseCheck({response})
    return response;
};

export async function getData({ sessionToken, columnList, tableName }) {
    const response  = await fetch('http://localhost:8000/user/get_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'authorization': sessionToken
        },
        body: JSON.stringify({
            column_list: columnList, // js array
            table_name: tableName // users, meal_plans
        })
    });
    responseCheck({response})
    return response;
};
