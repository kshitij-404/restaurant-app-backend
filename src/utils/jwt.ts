import * as jose from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");

type JWT = {
    data: jose.JWTPayload
    exp?: string
}

export const sign = async ({ data, exp = '15d'}: JWT) => 
    await new jose.SignJWT(data)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(secret)

export const verify = async (jwt: string) =>
    (await jose.jwtVerify(jwt, secret)).payload

export const jwt = {
    sign,
    verify
}