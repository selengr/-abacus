// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import cookie from "cookie";

type Data = {
  status: string
}


export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("shopy_token" , "" ,{
      httpOnly : true,
      maxAge : 0,
      sameSite : "lax",
      path: "/"
      // domain : '.'
      // secure : 
    })
  )
  res.status(200).json({ status: 'success' })
}
