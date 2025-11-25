
interface IRegexPatterns {
    EMAIL: RegExp;
    PASSWORD: RegExp;
    NAME: RegExp
}

// regex used across the server app
export const REGEX_PATTERN : IRegexPatterns = {
    EMAIL: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    NAME: /^[a-zA-Z\s]+$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
}


// const values used across the server app
interface IConstantValues {
    PASSWORD_MIN_LENGTH: number,
    NAME_MIN_LENGTH: number,
    NAME_MAX_LENGTH: number
}

export const CONSTANT_VALUES: IConstantValues = {
    PASSWORD_MIN_LENGTH: 8,
    NAME_MAX_LENGTH: 50,
    NAME_MIN_LENGTH: 2
}
