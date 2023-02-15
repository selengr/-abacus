import React, { FC } from "react";
import { useRouter } from "next/router";
import BlankState from "../app/components/BlankState";


const Error : FC = () => {
  const router = useRouter();

  return (


    <div  className="flex flex-col justify-center items-center mt-10 ">

    <img  
        src="/static/images/404.png"
      /> 
      
    <BlankState
      bordered
      title="Page Not Found"
      subtitle="This page does not exist. Please double-check the URL and try again."
      action={{
        style: "primary",
        label: "Go Back to Home",
        onClick: () => router.push("/"),
      }}

      />
      </div>
  );
};

Error.propTypes = {};

export default Error;