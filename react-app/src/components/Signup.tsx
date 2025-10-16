import { Link, useNavigate } from "react-router-dom";
import Header from "./Header";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from "axios";
import API_URL from "../constants";
import { signupSchema, SignupForm } from '../lib/validations';
import toast from 'react-hot-toast';

function Signup() {
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data: SignupForm) => {
        try {
            const url = API_URL + '/signup';
            const res = await axios.post(url, data);

            if (res.data.message) {
                toast.success(res.data.message);
                navigate('/login');
            }
        } catch (err: any) {
            console.error('Signup error:', err);
            const errorMessage = err.response?.data?.message || 'SERVER ERROR. Please try again.';
            toast.error(errorMessage);
        }
    };

    return (
        <div>
            <Header />
            <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                    <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Welcome to Signup Page</h3>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                                Username
                            </label>
                            <input
                                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.username ? 'border-red-500' : ''}`}
                                id="username"
                                type="text"
                                placeholder="Your username"
                                {...register('username')}
                            />
                            {errors.username && <p className="text-red-500 text-xs italic mt-1">{errors.username.message}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mobile">
                                Mobile
                            </label>
                            <input
                                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.mobile ? 'border-red-500' : ''}`}
                                id="mobile"
                                type="text"
                                placeholder="Your mobile number"
                                {...register('mobile')}
                            />
                            {errors.mobile && <p className="text-red-500 text-xs italic mt-1">{errors.mobile.message}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                Email
                            </label>
                            <input
                                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.email ? 'border-red-500' : ''}`}
                                id="email"
                                type="email"
                                placeholder="Your email"
                                {...register('email')}
                            />
                            {errors.email && <p className="text-red-500 text-xs italic mt-1">{errors.email.message}</p>}
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <input
                                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${errors.password ? 'border-red-500' : ''}`}
                                id="password"
                                type="password"
                                placeholder="********"
                                {...register('password')}
                            />
                            {errors.password && <p className="text-red-500 text-xs italic mt-1">{errors.password.message}</p>}
                        </div>
                        <div className="flex items-center justify-between">
                            <button
                                className="bg-primary-700 hover:bg-primary-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Signing up...' : 'SIGNUP'}
                            </button>
                            <Link className="inline-block align-baseline font-bold text-sm text-primary-600 hover:text-primary-800" to="/login">
                                Already have an account? Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Signup;
