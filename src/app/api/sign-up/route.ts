import { message } from 'first';
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs"

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { date } from 'zod';

export async function POST(request: Request){
    await dbConnect()

    try {
      const {username, email, password} = await request.json()
      const existingUserVerifiedByUsername= await UserModel.findOne({
        username,
        isVerified: true
       })

      if(existingUserVerifiedByUsername){
        return Response.json({
            success: false,
            message: "Username is already taken"
        }, {status:400})
      }

      const existingUserByEmail= await UserModel.findOne({email})
      const verifyCode = Math.floor(100000+ Math.random()* 900000).toString()

     if (existingUserByEmail){
        true// todo: back here
     } else{
       const hasedPassword = await bcrypt.hash(password,10)
       const expiryDate = new Date ()
       expiryDate.setHours(expiryDate.getHours()+1)

       new UserModel({
        username,
        email,
        password: hasedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: []
       })

       await newUser.save()
     }

     //send verification email
    const emailResponse = await sendVerificationEmail(
        email,
     username,
     verifyCode
     )
     

    } catch (error) {
        console.error('Error registering user', error)
        return Response.json(
        {
            success: false,
            message: "Error registering user"
        },
        {
            status: 500
        }
        )
    }
}