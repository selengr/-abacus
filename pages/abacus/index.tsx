import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Plus from "../../app/abacus/plus";
import styles from "../../styles/abacus/Abacus.module.css";

interface RegisterformValues { }


const Abacus : NextPage = () => {

  const [ doCounting , setDoCounting ] = useState(0)


  useEffect(() => {

  }, [])


  return (
    <div className={styles.mainPlus}>
       <Plus />
    </div>
  );
};

export default Abacus;