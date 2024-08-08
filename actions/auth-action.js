'use server';

export async function signup(prevState, formData) {
    const email = formData.get('email');
    const password = formData.get('password');

    let errors = {};

    if (!email.includes('@')) errors.email = 'PLease enter a valid email'
    if(password.trim().length < 8) errors.password = "Min of 8 character required"
}

