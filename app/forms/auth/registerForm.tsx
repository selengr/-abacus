import {  withFormik } from "formik";
import Router from "next/router";
import * as yup from "yup";

import InnerRegisterForm from "../../components/auth/innerRegisterForm";
import { RegisterFormValuesInterface } from "../../contracts/auth";
import ValidationError from "../../exceptions/validationError";
import callApi from "../../helpers/callApi";

const phoneRegExp = /^(0|0098|\+98)9(0[1-5]|[1 3]\d|2[0-2]|98)\d{7}$/

const registerFormValidationSchema = yup.object().shape({
    name : yup.string().required().min(4),
    phone : yup.string().required().min(8).matches(phoneRegExp, 'the phone format is not correct')
})

interface RegisterFormProps {
}

const RegisterForm = withFormik<RegisterFormProps , RegisterFormValuesInterface>({
    mapPropsToValues : props => ({
        name : '',
        phone : '',
    }),
    validationSchema: registerFormValidationSchema,
    handleSubmit : async (values , { setFieldError }) => {
        try {
            const res = await callApi().post('/auth/register' , values);
            if(res.status === 201) {
                Router.push('/auth/login')
            }
        } catch (error) {
            if(error instanceof ValidationError) {
                Object.entries(error.messages).forEach( ( [key , value] ) => setFieldError(key , value as string))
            }
        }
    }
})(InnerRegisterForm)

export default RegisterForm;