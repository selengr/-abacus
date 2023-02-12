import styles from "../../styles/abacus/Abacus.module.css";
import { useEffect, useState, FC } from "react";
import { setInterval } from "timers";


interface RegisterformValues { }
interface Verifycount {
    count: number;
}

const Plus: FC = () => {

    const [doCounting, setDoCounting] = useState<Verifycount>( {count : 0} )

    const dataCell: number[] = [
        1,
         2, 3, 4, 5, 6, 7
    ]

   


   

    return (
        <>
            <div className={styles.container}>

                {
                    dataCell.reverse().map((item, index) => {
                        return <div >
                            <Unit w={index} />
                            <span id={`last-count${index}`}>{doCounting.count}</span>
                            {/* {unit(1)}
                            <span id={`last-count${1}`}>{doCounting.count}</span>
                            {unit(2)}
                            <span id={`last-count${2}`}>{doCounting.count}</span>
                            {unit(3)}
                            <span id={`last-count${3}`}>{doCounting.count}</span>
                            {unit(4)}
                            <span id={`last-count${4}`}>{doCounting.count}</span>
                            {unit(5)}
                            <span id={`last-count${5}`}>{doCounting.count}</span>
                            {unit(6)}
                            <span id={`last-count${6}`}>{doCounting.count}</span>
                            {unit(7)}
                            <span id={`last-count${7}`}>{doCounting.count}</span> */}
                           
                        </div>
                     })
                 }

            </div>
        </>
    );
};

export default Plus;




const Unit = ({w }) => {


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
    

    // if(heavy !== 0 || heavy !== undefined){
    //     heavy = heavy
    // }
    // if (e.target.classList.contains("active-number")) {

    //     e.target.classList.remove("active-number")
    //     if (number !== 'not') {
    //         light = number - 1
    //     }
    //     if (high) {
    //         heavy -= high
    //     }
    //     if (isNaN(heavy)) heavy = 0 

    // } else {

    //     e.target.classList.add("active-number")
    //     if (number !== 'not') {
    //         light = number
    //         heavy = heavy
    //     }
    //     if (high) {
    //         heavy = high
    //         light = light
    //     }
    
    // }
        if (isNaN(heavy)) heavy = 0      
    light = light === undefined ? 0 : light

// console.log("heavy + light ",heavy , light )

let data = (e.target.id.slice(-1))
// setDoCounting({count : total})

    // Array.from(four);

    // 
    // heavy =  heavy
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
    check.innerHTML = total

}


// const unit = (w: number) => {
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
// }



}

export { Unit }
