import styles from "../../styles/abacus/Abacus.module.css";
import { useEffect, useState, FC } from "react";


interface RegisterformValues { }
interface Verifycount {
    count: number;
    row : number
}

const Plus: FC = () => {

    const [doCounting, setDoCounting] = useState<Verifycount>( {count : 0} )
    // const [counterState, updateCounterState] = useState( 0 )

    const dataCell: number[] = [
        1, 2, 3, 4, 5, 6, 7
    ]

  let first_num
  let second_num 
  let sum
  
//   useEffect(()=>{
   
//   },[])

  rendomData()
  function rendomData  ()  {debugger
     first_num = Math.floor(Math.random()*99 )
     second_num = Math.floor(Math.random()*99 )
     sum = first_num + second_num
  }

  let conclude : [number] = [0,0,0,0,0,0,0]
 
  let list : [{w:number | undefined, val:number | undefined}]  = []
  const doset  = async (val : number, w : number)   => {
      let flag = true

        Array.isArray(list)
        list.map((item,index ) => {
          if ( item.w === w  ) {
              list[index] = { w , val }
              flag = false
            }  
        })
        if (flag) list.push({w , val})

    
            let e = Math.pow(10, w);
            conclude[w] = ( val * e)    
            
           let concludeSum = 0
            conclude.map(item => {
                concludeSum += item
            })
            if(concludeSum === sum ) {
            // alert("well done  that set")
            let b = await rendomData()

            }
        console.log("conclude",conclude)
        console.log("concludeSum",concludeSum)
     

  }

    return (
        <>
<div>
</div>
<span>{first_num}===+===</span>

    <span>{second_num}===+===</span>
    <span>{sum}</span>
            <div className={styles.container}>
                {
                    dataCell.reverse().map((item, index) => {
                        return <div >

                            <Unit w={index} doset={(val,w)=>doset(val , w)} />
                            <span id={`last-count${index}`}>{doCounting.count}</span>
                           
                        </div>
                     })
                 }

            </div>
        </>
    );
};

export default Plus;


// ================================================================================the second one

const Unit = ({ w , doset }) => {

    const [doCounting, set] = useState<Verifycount>()

    let one: string | NodeListOf<Element>,
        two: string | NodeListOf<Element>,
        three: string | NodeListOf<Element>,
        four: string | NodeListOf<Element>,
        five: string | NodeListOf<Element>


    useEffect(() => {

        one = document.querySelectorAll(".one")
        one.forEach((item: Element) => item.style.bottom = "0")
        two = document.querySelectorAll(".two")
        two.forEach((item: Element) => item.style.bottom = "36px")
        three = document.querySelectorAll(".three")
        three.forEach((item: Element) => item.style.bottom = "72px")
        four = document.querySelectorAll(".four")
        four.forEach((item: Element) => item.style.bottom = "108px")
        five = document.querySelectorAll(".five")
        five.forEach((item: Element) => item.style.top = "0")

    }, [])


   
let light: string | number
let total: number | string
let heavy : number | string  

const validations = (e: React.ChangeEvent<HTMLInputElement>, which: number, number: number | string, high: number) => {
    

    if (isNaN(heavy)) heavy = 0      
    light = light === undefined ? 0 : light
    let data = (e.target.id.slice(-1))


    if (e.target.id == `four${which}`) {
        if (four[parseInt(data)].style.bottom == "144px") {
            four[parseInt(data)].style.bottom = "108px"
            three[parseInt(data)].style.bottom = "72px"
            two[parseInt(data)].style.bottom = "36px"
            one[parseInt(data)].style.bottom = "0px"
            light = number - 1
            
        }else {
            four[parseInt(data)].style.bottom = "144px"
            light = number 
            heavy =  heavy
        }
      
    }
    if (e.target.id == `three${which}`) {
        if (three[parseInt(data)].style.bottom == "108px") {
            three[parseInt(data)].style.bottom = "72px"
            two[parseInt(data)].style.bottom = "36px"
            one[parseInt(data)].style.bottom = "0px"
            light = number - 1
            
        }else{
            
        four[parseInt(data)].style.bottom = "144px"
        three[parseInt(data)].style.bottom = "108px"
        heavy =  heavy
        light = number 
        }
        
    }
    if (e.target.id == `two${which}`) {


        if (two[parseInt(data)].style.bottom == "72px") {
            two[parseInt(data)].style.bottom = "36px"
            one[parseInt(data)].style.bottom = "0px"
            light = number - 1
        }else{
            four[parseInt(data)].style.bottom = "144px"
            three[parseInt(data)].style.bottom = "108px"
            two[parseInt(data)].style.bottom = "72px"
            heavy =  heavy
            light = number 
        }
       
    }
    if (e.target.id == `one${which}`) {

        if (one[parseInt(data)].style.bottom == "36px") {
            one[parseInt(data)].style.bottom = "0px"
            
            light = number - 1
            
        }else {
            four[parseInt(data)].style.bottom = "144px"
        three[parseInt(data)].style.bottom = "108px"
        two[parseInt(data)].style.bottom = "72px"
        one[parseInt(data)].style.bottom = "36px"
        heavy =  heavy
        light = number 
        }
        
    }

    if (e.target.id === `five${which}`) {
        if (five[parseInt(data)].style.top == "36px") {
            five[parseInt(data)].style.top = "0px"
            heavy = 0 
            
        }else {
            five[parseInt(data)].style.top = "36px"
            heavy = high
        }
    }


    console.log( "heavy + light ", heavy , light )
    
    total = heavy + light 
    let check = document.querySelector(`#last-count${data}`) 
    doset(total,which)
    check.innerHTML = total

}


    const move = (e: any, which: number, number: string | number, high?: number) => validations(e, which, number, high)

    return (
        <div className={styles.pack}>
            <div onClick={(e) => move(e, w, "not", 5)} data-id={`five${w}`} id={`five${w}`} className={`${styles.nut} five`}> </div>
            <div onClick={(e) => move(e, w, 1)} data-id={`four`} id={`four${w}`} className={`${styles.nut} four`}> </div>
            <div onClick={(e) => move(e, w, 2)} data-id={`three`} id={`three${w}`} className={`${styles.nut} three`}> </div>
            <div onClick={(e) => move(e, w, 3)} data-id={`two`} id={`two${w}`} className={`${styles.nut} two`}> </div>
            <div onClick={(e) => move(e, w, 4)} data-id={`one`} id={`one${w}`} className={`${styles.nut} one`}> </div>

        </div>
    )
}

export { Unit }
