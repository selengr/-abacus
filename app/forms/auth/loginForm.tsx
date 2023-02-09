import { withFormik } from "formik";
import Router from "next/router";
import * as yup from "yup";

import InnerLoginForm from "../../components/auth/innerLoginForm";
import { LoginFormValuesInterface } from "../../contracts/auth";
import ValidationError from "../../exceptions/validationError";
import callApi from "../../helpers/callApi";

const phoneRegExp = /^(0|0098|\+98)9(0[1-5]|[1 3]\d|2[0-2]|98)\d{7}$/

const loginFormValidationSchema = yup.object().shape({
    phone : yup.string().required().min(8).matches(phoneRegExp, 'the phone format is not correct')
})

interface LoginFormProps {
    setToken : (token : string) => void
}

const LoginForm = withFormik<LoginFormProps , LoginFormValuesInterface>({
    mapPropsToValues : props => ({
        phone : ''
    }),
    validationSchema: loginFormValidationSchema,
    handleSubmit : async (values , { props , setFieldError }) => {
        try {
            const res = await callApi().post('/auth/login' , values)
            if(res.status === 200) {
                props.setToken(res.data.token);
                Router.push('/auth/login/step-two')
            }
        } catch (error) {
            if(error instanceof ValidationError) {
                Object.entries(error.messages).forEach( ( [key , value] ) => setFieldError(key , value as string))
            }

            console.log(error)
        }

    }
})(InnerLoginForm)

export default LoginForm;