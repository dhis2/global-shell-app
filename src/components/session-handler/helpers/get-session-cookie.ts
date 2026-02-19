import Cookies from 'js-cookie'

const SESSION_EXPIRY_COOKIE_NAME = 'SESSION_EXPIRE'

const getSessionCookie = () => {
    const sessionTimeout =
        Number(Cookies.get(SESSION_EXPIRY_COOKIE_NAME)) * 1000

    return sessionTimeout
}

export default getSessionCookie
