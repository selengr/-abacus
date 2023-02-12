import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Plus from "../../app/abacus/plus";

interface RegisterformValues { }


const Abacus : NextPage = () => {

  const [ doCounting , setDoCounting ] = useState(0)


  useEffect(() => {

  }, [])





  return (
    <>
      <Plus />
    </>
  );
};

export default Abacus;