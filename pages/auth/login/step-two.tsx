import Router from 'next/router';
import { useEffect } from 'react';
import GuestLayout from '../../../app/components/guestLayout';
import PhoneVerifyForm from '../../../app/forms/auth/phoneVerifyForm'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { selectPhoneVerifyToken, updatePhoneVerifyToken } from '../../../app/store/auth';
import { NextPageWithLayout } from '../../_app';

const PhoneVerify : NextPageWithLayout = () => {

    const dispatch = useAppDispatch();
    const token = useAppSelector(selectPhoneVerifyToken);

    const clearPhoneVerifyToken = () => {
        dispatch(updatePhoneVerifyToken(undefined))
    }

    useEffect(() => {
        Router.beforePopState(({ url, as, options }) => {
            clearPhoneVerifyToken();
            return true
        })

        if(token === undefined) {
            Router.push('/auth/login')
        }
    },[token]);

    return (
        <>
            <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <img
                        className="mx-auto h-12 w-auto"
                        src="https://tailwindui.com/img/logos/workflow-mark.svg?color=indigo&shade=600"
                        alt="Workflow"
                    />
                    <h2 className="mt-6 text-center text-3xl tracking-tight font-bold text-gray-900">Login Phone Verify</h2>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

                        <PhoneVerifyForm token={token} clearToken={clearPhoneVerifyToken} />
                    </div>
                </div>
            </div>
        </>
    )
}

PhoneVerify.getLayout = page => <GuestLayout>{page}</GuestLayout>


export default PhoneVerify
