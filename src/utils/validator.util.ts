import validator from 'validator'

export const isEmail = (email: string) => {
  return email && validator.isEmail(email.toString())
}

export const isUUID = (uuid: string) => {
  return uuid && validator.isUUID(uuid.toString())
}

export const isObjectId = (objectId: string) => {
    return objectId && validator.isMongoId(objectId.toString())
}

export const isAlphanumeric = (str: string) => {
    return str && validator.isAlphanumeric(str.toString())
}

export const isAlphanumericWithSpaces = (str: string) => {
    return str && validator.isAlphanumeric(str.toString().replace(/\s/g, ''))
}

export const isAlphaWithSpaces = (str: string) => {
    return str && validator.isAlpha(str.toString().replace(/\s/g, ''))
}

export const isJwt = (jwt: string) => {
    return jwt && validator.isJWT(jwt.toString())
}

export const isUrl = (url: string) => {
    return url && validator.isURL(url.toString())
}

export const isAlpha = (str: string) => {
    return str && validator.isAlpha(str.toString())
}

export const isNumeric = (num: string) => {
    return num && validator.isNumeric(num.toString())
}

export const isFloat = (float: string) => {
    return float && validator.isFloat(float.toString())
}

export const isInt = (int: string) => {
    return int && validator.isInt(int.toString())
}

export const isPhone = (phone: string) => {
    return phone && validator.isMobilePhone(phone.toString(), 'en-NG')
}
