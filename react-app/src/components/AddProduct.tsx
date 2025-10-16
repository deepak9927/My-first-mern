import { useEffect } from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import categories from "./CategoriesList"; // Assuming this exports a default array of strings
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addProductSchema, AddProductForm } from '../lib/validations';
import toast from 'react-hot-toast';
import { useAddProduct } from '../hooks/useAddProduct';

function AddProduct() {
    const navigate = useNavigate();
    const { mutate: addProduct, isPending: isSubmitting } = useAddProduct();

    const { register, handleSubmit, formState: { errors } } = useForm<AddProductForm>({
        resolver: zodResolver(addProductSchema),
    });

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
            toast.error('Please login to add products.');
        }
    }, [navigate]);

    const onSubmit = async (data: AddProductForm) => {
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            const formData = new FormData();
            formData.append('plat', position.coords.latitude.toString());
            formData.append('plong', position.coords.longitude.toString());
            formData.append('pname', data.pname);
            formData.append('pdesc', data.pdesc);
            formData.append('price', data.price.toString());
            formData.append('category', data.category);
            formData.append('condition', data.condition);
            formData.append('pimage', data.pimage[0]);
            if (data.pimage2 && data.pimage2.length > 0) {
                formData.append('pimage2', data.pimage2[0]);
            }
            formData.append('userId', localStorage.getItem('userId') || '');

            addProduct(formData);
        } catch (err: any) {
            console.error('Add product error:', err);
            toast.error('Could not get location. Please enable location services.');
        }
    };

    return (
        <div>
            <Header />
            <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gray-100 p-4">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">ADD PRODUCT HERE</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="pname">
                                Product Name
                            </label>
                            <input
                                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.pname ? 'border-red-500' : ''}`}
                                id="pname"
                                type="text"
                                placeholder="Enter product name"
                                {...register('pname')}
                            />
                            {errors.pname && <p className="text-red-500 text-xs italic mt-1">{errors.pname.message}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="pdesc">
                                Product Description
                            </label>
                            <textarea
                                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.pdesc ? 'border-red-500' : ''}`}
                                id="pdesc"
                                rows={4}
                                placeholder="Enter product description"
                                {...register('pdesc')}
                            ></textarea>
                            {errors.pdesc && <p className="text-red-500 text-xs italic mt-1">{errors.pdesc.message}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                                Product Price
                            </label>
                            <input
                                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.price ? 'border-red-500' : ''}`}
                                id="price"
                                type="number"
                                step="0.01"
                                placeholder="Enter product price"
                                {...register('price', { valueAsNumber: true })}
                            />
                            {errors.price && <p className="text-red-500 text-xs italic mt-1">{errors.price.message}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                                Product Category
                            </label>
                            <select
                                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.category ? 'border-red-500' : ''}`}
                                id="category"
                                {...register('category')}
                            >
                                <option value="">Select a category</option>
                                {categories && categories.length > 0 &&
                                    categories.map((item, index) => (
                                        <option key={'option' + index} value={item}>
                                            {item}
                                        </option>
                                    ))}
                            </select>
                            {errors.category && <p className="text-red-500 text-xs italic mt-1">{errors.category.message}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="condition">
                                Product Condition
                            </label>
                            <select
                                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.condition ? 'border-red-500' : ''}`}
                                id="condition"
                                {...register('condition')}
                            >
                                <option value="">Select condition</option>
                                <option value="new">New</option>
                                <option value="like-new">Like New</option>
                                <option value="good">Good</option>
                                <option value="fair">Fair</option>
                                <option value="poor">Poor</option>
                            </select>
                            {errors.condition && <p className="text-red-500 text-xs italic mt-1">{errors.condition.message}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="pimage">
                                Product Image (Primary)
                            </label>
                            <input
                                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.pimage ? 'border-red-500' : ''}`}
                                id="pimage"
                                type="file"
                                accept="image/*"
                                {...register('pimage')}
                            />
                            {errors.pimage && <p className="text-red-500 text-xs italic mt-1">{errors.pimage.message}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="pimage2">
                                Product Second Image (Optional)
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="pimage2"
                                type="file"
                                accept="image/*"
                                {...register('pimage2')}
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-primary-700 hover:bg-primary-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Adding Product...' : 'ADD PRODUCT'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddProduct;
