import axios from "axios";
import ValidationError from "../exceptions/validationError";


const callApi = () => {
    const axiosInstance = axios.create({
        baseURL : 'http://localhost:5000/api'
    })

    axiosInstance.interceptors.request.use(
        (config) => {
            config.withCredentials = true;
            return config;
        },
        err => { throw err } 
    )

    axiosInstance.interceptors.response.use(
        res => {
            return res;
        },
        err => {
            const res = err?.response
            if(res) {
                if(res.status === 422) {
                    throw new ValidationError(res.data.errors)
                }
            }


            throw err; 
        }
    )

    return axiosInstance;
}


export default callApi;