
export interface LoginFormValuesInterface {
    phone: string
}

export interface RegisterFormValuesInterface {
    name: string,
    phone: string
}

export interface PhoneVerifyFormValuesInterface {
    code : string
    token : string
}