import { useState} from 'react';
import AdminPanelLayout from "../../../app/components/adminPanelLayout";
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { NextPageWithLayout } from "../../_app";
import { Dialog } from '@headlessui/react'

const people = [
    { name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member' },
    // More people...
]

const ProductList: NextPageWithLayout = () => {
    const [ showAddProduct , setShowAddProduct ] = useState(false);


    return (
        <>
            <Dialog
             as="div"
             className="fixed inset-0 z-10 overflow-y-auto"
              open={showAddProduct} onClose={() => setShowAddProduct(false)}>
                <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-[.4]" />
                <span className="inline-block h-screen align-middle">&#8203;</span>
                <div className={`inline`}>
                    <div
                    className="inline-block w-full max-w-4xl mt-8 mb-20 overflow-hidden text-right align-middle transition-all transform bg-white shadow-xl rounded-lg opacity-100 scale-100">
                        <div>
                            <p>
                            Are you sure you want to deactivate your account? All of your data
                            will be permanently removed. This action cannot be undone.
                            </p>

                            <button onClick={() => setShowAddProduct(false)}>Deactivate</button>
                            <button onClick={() => setShowAddProduct(false)}>Cancel</button>
                        </div>
                    </div>
                  
                </div>
           
            </Dialog>
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-xl font-semibold text-gray-900">لیست محصولات</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            در این صفحه لیست محصولات وبسایت به شما نمایش داده می‌شود
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:mr-16 sm:flex-none">
                        <button
                            onClick={() => setShowAddProduct(true)}
                            type="button"
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                        >
                            اضافه کردن محصول
                        </button>
                    </div>
                </div>
                <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-gray-900 sm:pl-6">
                                                شماره محصول
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                                عنوان
                                            </th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {people.map((person) => (
                                            <tr key={person.email}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                    {person.name}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.title}</td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <a href="#" className="text-indigo-600 hover:text-indigo-900 ml-4">
                                                        ویرایش
                                                    </a>
                                                    <a href="#" className="text-indigo-600 hover:text-indigo-900">
                                                        حذف
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="p-4 mt-2 border-t border-gray-200">
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        <a
                                            href="#"
                                            className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20"
                                        >
                                            <span className="sr-only">Next</span>
                                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                                        </a>
                                        {/* Current: "z-10 bg-indigo-50 border-indigo-500 text-indigo-600", Default: "bg-white border-gray-300 text-gray-500 hover:bg-gray-50" */}
                                        <a
                                            href="#"
                                            aria-current="page"
                                            className="relative z-10 inline-flex items-center border border-indigo-500 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 focus:z-20"
                                        >
                                            1
                                        </a>
                                        <a
                                            href="#"
                                            className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20"
                                        >
                                            2
                                        </a>
                                        <a
                                            href="#"
                                            className="relative hidden items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 md:inline-flex"
                                        >
                                            3
                                        </a>
                                        <span className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">
                                            ...
                                        </span>
                                        <a
                                            href="#"
                                            className="relative hidden items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 md:inline-flex"
                                        >
                                            8
                                        </a>
                                        <a
                                            href="#"
                                            className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20"
                                        >
                                            9
                                        </a>
                                        <a
                                            href="#"
                                            className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20"
                                        >
                                            10
                                        </a>

                                        <a
                                            href="#"
                                            className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20"
                                        >
                                            <span className="sr-only">Previous</span>
                                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                                        </a>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

ProductList.getLayout = (page) => <AdminPanelLayout>{page}</AdminPanelLayout>

export default ProductList;