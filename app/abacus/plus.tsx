import { NextPage } from "next";
import React, { useState, useEffect, useContext, createContext } from 'react';
import { MyStopwatch } from "../components/timer";
import styles from "../../styles/abacus/Abacus.module.css";
import { useCookies } from "react-cookie";

interface RegisterformValues { }
interface Verifycount {
    count: number;
    row?: number
}

let one: string | NodeListOf<Element>,
    two: string | NodeListOf<Element>,
    three: string | NodeListOf<Element>,
    four: string | NodeListOf<Element>,
    five: string | NodeListOf<Element>


const ThemeContext = createContext(null);


let nut1 = "5px", nut2 = "41px", nut3 = "77px", nut4 = "113px", nut5 = "149px"
let first_num, second_num, third_num, sum: any, sum_third: any
const Plus: NextPage = () => {

    let tim = 0
    // const [tim, setTim] = useState<any>(0);
    // const value = useContext(ThemeContext)
    const [cookies, setCookie, removeCookie] = useCookies(["user", "minutes", "seconds"]);


    const [doCounting, setDoCounting] = useState<Verifycount>({ count: 0 })


    // let time = new Date();
    // time.setSeconds(time.getSeconds() + 600); // 10 minutes timer

    // const [counterState, updateCounterState] = useState( 0 )

    let dataCell: number[] = [
        1, 2, 3, 4, 5, 6, 7
    ]


    useEffect(() => {

        intialConfig()
    }, [])

    const intialConfig = () => {

        first_num = Math.floor(Math.random() * 99)
        second_num = Math.floor(Math.random() * 99)
        third_num = Math.floor(Math.random() * 99)
        sum = first_num + second_num
        sum_third = first_num + second_num + third_num

        let node: Element | null
        node = document.querySelector("#suggest-number")
        if (node) node.innerHTML = `${first_num}&nbsp;+&nbsp;${second_num}`
        if (node) node.style.color = `black`
        let node2: Element | null
        node2 = document.querySelector("#suggest-number-third")
        if (node2) node2.innerHTML = `&nbsp;+&nbsp;${third_num}`
        if (node2) node2.style.color = `black`
    }


    let conclude: number[] = [0, 0, 0, 0, 0, 0, 0]

    let list: { w: number | undefined, val: number | undefined }[] = []
    const doset = async (val: number, w: number) => {
        let flag = true

        Array.isArray(list)
        list.map((item, index) => {
            if (item.w === w) {
                list[index] = { w, val }
                flag = false
            }
        })
        if (flag) list.push({ w, val })


        let e = Math.pow(10, w);
        conclude[w] = (val * e)

        let concludeSum = 0
        conclude.map(item => {
            concludeSum += item
        })
        if (concludeSum === sum) {
            let node: Element | null = document.querySelector("#suggest-number")
            if (node) node.style.textDecoration = "underline"
            if (node) node.style.fontWeight = "bold"
        }
        else {
            let node: Element | null = document.querySelector("#suggest-number")
            if (node) node.style.textDecoration = "none"
            if (node) node.style.fontWeight = "inherit"
        }
        if (concludeSum === sum_third) {
            let node: Element | null = document.querySelector("#suggest-number")
            if (node) node.textContent = ""

            const el: Element | null = document.querySelector("#suggest-number-third")
            if (el) el.textContent = "next"
            if (el) el.style.zIndex = "999"
            document.querySelector(".Abacus_container").style.pointerEvents = "none";

            cookies["user"] === "undefind" ||
            cookies["user"] === "NaN" ||
            typeof cookies["user"] !== "number" 
              ? cookies("user" ,[ 1 ] ) :
                setCookie("user", cookies["user"] + 1 );

            if (cookies["user"] === 2) {
                let seconds = cookies["seconds"]
                let minutes = cookies["minutes"]
                cookies.remove["user"]
            }
        }
    }

    const next_level = (Event: React.FormEvent<HTMLDivElement>) => {
        Event.preventDefault()
        let node: Element | null = document.querySelector("#suggest-number")


        if (Event.target.outerText === "next") {
            const count = document.querySelectorAll(".count-unit")
            count.forEach(item => item.textContent = "0")
            if (Event) Event.currentTarget.style.fontWeight = ""
            if (Event) Event.currentTarget.style.textDecoration = ""
            if (node) node.style.textDecoration = ""
            if (node) node.style.fontWeight = ""



            one = document.querySelectorAll(".one")
            one.forEach((item: Element) => item.style.bottom = "5px")
            two = document.querySelectorAll(".two")
            two.forEach((item: Element) => item.style.bottom = nut2)
            three = document.querySelectorAll(".three")
            three.forEach((item: Element) => item.style.bottom = nut3)
            four = document.querySelectorAll(".four")
            four.forEach((item: Element) => item.style.bottom = nut4)
            five = document.querySelectorAll(".five")
            five.forEach((item: Element) => item.style.top = "5px  ")

            document.querySelector(".Abacus_container").style.pointerEvents = "auto";

            setTimeout(() => {
                intialConfig()
            }, 1);

        }
    }

    return (
        <ThemeContext.Provider value={tim}>
            <div className={`${styles.wood} `} >

                <div className="flex">
                    <div id="suggest-number" className={styles.suggestNumber}></div>
                    <div id="suggest-number-third" onClick={next_level} className={styles.suggestNumber}></div>
                </div>


                <div>
                    <MyStopwatch />
                </div>

                <div className={`${styles.container} Abacus_container`}>
                    {
                        dataCell.reverse().map((item, index) => {
                            return (<div key={index.toString()}>

                                <Unit w={index} doset={(val, w) => doset(val, w)} />
                                <span id={`last-count${index}`} className={`${styles.counter} count-unit`}>{doCounting.count}</span>

                            </div>)
                        })
                    }

                </div>
            </div>
        </ThemeContext.Provider>
    );
};

export default Plus;


// ================================================================================the second one

const Unit = ({ w, doset }: any) => {

    const [doCounting, set] = useState<Verifycount>()




    useEffect(() => {

        one = document.querySelectorAll(".one")
        one.forEach((item: Element) => item.style.bottom = "5px")
        two = document.querySelectorAll(".two")
        two.forEach((item: Element) => item.style.bottom = nut2)
        three = document.querySelectorAll(".three")
        three.forEach((item: Element) => item.style.bottom = nut3)
        four = document.querySelectorAll(".four")
        four.forEach((item: Element) => item.style.bottom = nut4)
        five = document.querySelectorAll(".five")
        five.forEach((item: Element) => item.style.top = "5px  ")

    }, [])



    let light: string | number
    let total: number | string
    let heavy: number | string

    const validations = (e: React.ChangeEvent<HTMLInputElement>, which: number, number: number | string, high: number) => {


        if (isNaN(heavy)) heavy = 0
        light = light === undefined ? 0 : light
        let data = (e.target.id.slice(-1))


        if (e.target.id == `four${which}`) {
            if (four[parseInt(data)].style.bottom == nut5) {
                four[parseInt(data)].style.bottom = nut4
                three[parseInt(data)].style.bottom = nut3
                two[parseInt(data)].style.bottom = nut2
                one[parseInt(data)].style.bottom = nut1
                light = number - 1

            } else {
                four[parseInt(data)].style.bottom = nut5
                light = number
                heavy = heavy
            }

        }
        if (e.target.id == `three${which}`) {
            if (three[parseInt(data)].style.bottom == nut4) {
                three[parseInt(data)].style.bottom = nut3
                two[parseInt(data)].style.bottom = nut2
                one[parseInt(data)].style.bottom = nut1
                light = number - 1

            } else {

                four[parseInt(data)].style.bottom = nut5
                three[parseInt(data)].style.bottom = nut4
                heavy = heavy
                light = number
            }

        }
        if (e.target.id == `two${which}`) {


            if (two[parseInt(data)].style.bottom == nut3) {
                two[parseInt(data)].style.bottom = nut2
                one[parseInt(data)].style.bottom = nut1
                light = number - 1
            } else {
                four[parseInt(data)].style.bottom = nut5
                three[parseInt(data)].style.bottom = nut4
                two[parseInt(data)].style.bottom = nut3
                heavy = heavy
                light = number
            }

        }
        if (e.target.id == `one${which}`) {

            if (one[parseInt(data)].style.bottom == nut2) {
                one[parseInt(data)].style.bottom = nut1

                light = number - 1

            } else {
                four[parseInt(data)].style.bottom = nut5
                three[parseInt(data)].style.bottom = nut4
                two[parseInt(data)].style.bottom = nut3
                one[parseInt(data)].style.bottom = nut2
                heavy = heavy
                light = number
            }

        }

        if (e.target.id === `five${which}`) {
            if (five[parseInt(data)].style.top == nut2) {
                five[parseInt(data)].style.top = nut1
                heavy = 0

            } else {
                five[parseInt(data)].style.top = nut2
                heavy = high
            }
        }



        total = heavy + light
        let check = document.querySelector(`#last-count${data}`)
        doset(total, which)
        check.innerHTML = total

    }


    const move = (e: any, which: number, number: string | number, high?: number) => validations(e, which, number, high)

    return (
        <div className={styles.pack}>
            <div className={styles.pipe}>

                <span></span>
            </div>
            <div onClick={(e) => move(e, w, "not", 5)} data-id={`five${w}`} id={`five${w}`} className={`${styles.nut} five`}> </div>
            <div onClick={(e) => move(e, w, 1)} data-id={`four`} id={`four${w}`} className={`${styles.nut} four`}> </div>
            <div onClick={(e) => move(e, w, 2)} data-id={`three`} id={`three${w}`} className={`${styles.nut} three`}> </div>
            <div onClick={(e) => move(e, w, 3)} data-id={`two`} id={`two${w}`} className={`${styles.nut} two`}> </div>
            <div onClick={(e) => move(e, w, 4)} data-id={`one`} id={`one${w}`} className={`${styles.nut} one`}> </div>

        </div>
    )
}

export { Unit }
