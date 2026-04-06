export async function login({ email, password }) {
    try {
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
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
    } catch (error) {
        console.error("Login Failed:", error.message);
    };
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
    return response;
};

export async function addMealPlan({ planName = null, swipesStart = null, diningDollarsStart = null }) {
  const response = await fetch('http://localhost:8000/user/update_meal_plan' , {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    plan_name: planName,
    swipes_start: swipesStart,
    dining_dollars_start: diningDollarsStart,
    })
  });
  return response;
};

export async function getUserData({ sessionToken, columnList, tableName }) {
    const response  = await fetch('http://localhost:8000/user/get_user_data', {
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
    return response;
};
