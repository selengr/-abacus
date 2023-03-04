import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Plus from "../../app/abacus/plus";
import styles from "../../styles/abacus/Abacus.module.css";
import Image from 'next/image';

interface RegisterformValues { }


const Abacus: NextPage = () => {

  const [doCounting, setDoCounting] = useState(0)


  useEffect(() => {

  }, [])


  return (

<>
<Image  
        src="/static/images/images (4).jfif"
        layout="fill"
        objectFit="fill"
        quality={100}
        className={styles.imageBackground}
      />
    <div className={styles.mainPlus}>
      <Plus />
    </div>
</>


  );
};

export default Abacus;