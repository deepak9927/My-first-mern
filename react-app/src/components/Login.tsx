import { Link } from "react-router-dom";
import Header from "./Header";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginForm } from '../lib/validations';
import { useLogin } from '../hooks/useAuth';
import ErrorMessage from './ErrorMessage';

function Login() {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const { mutate: login, isPending: isLoading, error } = useLogin();

    const onSubmit = (data: LoginForm) => {
        login(data);
    };

    return (
        <div>
            <Header />
            <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                    <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Welcome to Login Page</h3>
                    {error && <ErrorMessage message={error} />}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="identifier">
                                Email or Username
                            </label>
                            <input
                                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.identifier ? 'border-red-500' : ''}`}
                                id="identifier"
                                type="text"
                                placeholder="Your email or username"
                                {...register('identifier')}
                            />
                            {errors.identifier && <p className="text-red-500 text-xs italic mt-1">{errors.identifier.message}</p>}
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
                                disabled={isLoading}
                            >
                                {isLoading ? 'Logging in...' : 'LOGIN'}
                            </button>
                            <Link className="inline-block align-baseline font-bold text-sm text-primary-600 hover:text-primary-800" to="/signup">
                                Don't have an account? Sign Up
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
