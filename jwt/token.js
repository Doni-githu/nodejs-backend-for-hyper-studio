import jsonwebtoken from "jsonwebtoken";

const generateToken = (userId) => {
    const token = jsonwebtoken.sign({ userId }, process.env.SECRET_KEY)
    return token
}

const getToken = token => {
    const result = jsonwebtoken.decode(token, {complete: true})
    return result
}

export {
    generateToken,
    getToken
}