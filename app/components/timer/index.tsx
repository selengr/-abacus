import React, { useEffect } from 'react';
import { useStopwatch } from 'react-timer-hook';
import { useCookies } from "react-cookie";

function MyStopwatch({value}: any) {
    console.log(value)

    const [cookies, setCookie, removeCookie] = useCookies(["minutes","seconds"]);

    
    const {
        seconds,
        minutes,
        hours,
        days,
        isRunning,
        start,
        pause,
        reset,
    } = useStopwatch({ autoStart: true });
    

    
    // useEffect(()=>{
        
      
    //      setCookie("minutes", minutes )
    //      setCookie("seconds", seconds ) 
        
    // },[seconds])

  return (
    <div style={{textAlign: 'center'}}>
      <div style={{fontSize: '100px',color:"black"}}>
        <span >{minutes}</span>:<span>{seconds  }</span> 
      </div>
      {/* <p>{isRunning ? 'Running' : 'Not running'}</p> */}
      {/* <button onClick={start}>Start</button>
      <button onClick={pause}>Pause</button>
      <button onClick={reset}>Reset</button> */}
    </div>
  );
} 


export { MyStopwatch }