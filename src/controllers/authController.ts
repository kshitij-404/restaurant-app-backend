import { Context } from "elysia";
import url from "url";
import axios from "axios";
import { OAuth2Client } from 'google-auth-library';
import UserModel from "../models/userModel";
import { jwt } from "../utils/jwt";

export const authGoogleCallback = async (c: Context) => {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const code = c.query.code;

    if (!code) {
        throw new Error("No code provided");
    }

    try {
        const urlEncodedBody = new url.URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID || "",
            client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
            redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
            grant_type: "authorization_code",
        });

        const { data } = await axios.post(
            "https://www.googleapis.com/oauth2/v4/token",
            urlEncodedBody,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        )

        const response = await client.verifyIdToken({
            idToken: data.id_token,
            audience: process.env.GOOGLE_CLIENT_ID || "",
        })

        const payload = response.getPayload();

        if (!payload) {
            throw new Error("No payload found");
        }

        const { email_verified, email, given_name, family_name, picture } = payload;

        if (!email_verified) {
            throw new Error("Email not verified");
        }

        let user = await UserModel.findOne({ email });

        if (!user) {
            user = new UserModel({
                email,
                name: `${given_name} ${family_name}`,
                avatar: picture,
            });
            await user.save();
        }

        const accessToken = await jwt.sign({
            data: { userId: user._id }
        })

        return {
            status: c.set.status,
            success: true,
            data: { user, accessToken },
            message: "User logged in succesfully!"
        }
    } catch (error: any) {
        if (error.response) {
            console.error(error.response.data);
        } else {
            console.error(error.message);
        }
        throw error;
    }
}
