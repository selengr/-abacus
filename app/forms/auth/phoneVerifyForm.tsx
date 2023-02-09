import { withFormik } from "formik";
import Router from "next/router";
import * as yup from "yup";
import InnerPhoneVerify from "../../components/auth/innerPhoneVerifyForm";
import { PhoneVerifyFormValuesInterface } from "../../contracts/auth";

import ValidationError from "../../exceptions/validationError";
import { storeLoginToken } from "../../helpers/auth";
import callApi from "../../helpers/callApi";
 


const phoneVerifyFormValidationSchema = yup.object().shape({
    code : yup.string().required().matches(/^[0-9]+$/,"فقط میتوانید عدد وارد کنید").length(6)
})

interface PhoneVerifyFormProps {
    token? : string,
    clearToken : () => void
}

const PhoneVerifyForm = withFormik<PhoneVerifyFormProps , PhoneVerifyFormValuesInterface>({
    mapPropsToValues : props => ({
        code : '',
        token : props.token || ""
    }),
    validationSchema: phoneVerifyFormValidationSchema,
    handleSubmit : async (values , { props , setFieldError }) => {
        try {
           const res = await callApi().post('/auth/login/verify-phone' , values)
           if(res.status === 200) {
                // clear phon verify token from redux
                storeLoginToken(res.data?.user?.token);
                await Router.push('/panel');
                props.clearToken();
           }
        } catch (error) {
            if(error instanceof ValidationError) {
                Object.entries(error.messages).forEach( ( [key , value] ) => setFieldError(key , value as string))
            }

            console.log(error)
        }

    }
})(InnerPhoneVerify)

export default PhoneVerifyForm;