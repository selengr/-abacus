import styles from "../../styles/abacus/Abacus.module.css";
import { useEffect, useState, FC } from "react";
import Head from "next/head";


interface RegisterformValues { }
interface Verifycount {
    count: number;
    row: number
}
let nut1 = "0", nut2 = "36px", nut3 = "72px", nut4 = "108px", nut5 = "144px"
const Plus: FC = () => {

    const [doCounting, setDoCounting] = useState<Verifycount>({ count: 0 })
    const [first_num, setfirst_num] = useState(Math.floor(Math.random() * 99))
    const [second_num, setsecond_num] = useState(Math.floor(Math.random() * 99))
    const [sum, setsum] = useState(first_num + second_num)
    // const [counterState, updateCounterState] = useState( 0 )

    const dataCell: number[] = [
        1, 2, 3, 4, 5, 6, 7
    ]


    useEffect(() => {
        let node
        node = document.querySelector("#suggest-number")
        node.innerHTML = `${first_num}&nbsp;+&nbsp;${second_num}&nbsp;=&nbsp;${sum}`
      
    }, [])


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
            let node = document.querySelector("#suggest-number")
            node.style.textDecoration = "underline"
            node.style.fontWeight = "bold"
        }

    }

    return (
        <div id="wood" >

            <div id="suggest-number" className={styles.suggestNumber}></div>

            <div className={styles.container}>
                {
                    dataCell.reverse().map((item, index) => {
                        return <div key={index.toString()}>

                            <Unit w={index} doset={(val, w) => doset(val, w)} />
                            <span id={`last-count${index}`} className={styles.counter}>{doCounting.count}</span>

                        </div>
                    })
                }

            </div>
        </div>
    );
};

export default Plus;


// ================================================================================the second one

const Unit = ({ w, doset }) => {

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
        two.forEach((item: Element) => item.style.bottom = nut2)
        three = document.querySelectorAll(".three")
        three.forEach((item: Element) => item.style.bottom = nut3)
        four = document.querySelectorAll(".four")
        four.forEach((item: Element) => item.style.bottom = nut4)
        five = document.querySelectorAll(".five")
        five.forEach((item: Element) => item.style.top = "0")

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
            <div className={styles.pipe}></div>
            <div onClick={(e) => move(e, w, "not", 5)} data-id={`five${w}`} id={`five${w}`} className={`${styles.nut} five`}> </div>
            <div onClick={(e) => move(e, w, 1)} data-id={`four`} id={`four${w}`} className={`${styles.nut} four`}> </div>
            <div onClick={(e) => move(e, w, 2)} data-id={`three`} id={`three${w}`} className={`${styles.nut} three`}> </div>
            <div onClick={(e) => move(e, w, 3)} data-id={`two`} id={`two${w}`} className={`${styles.nut} two`}> </div>
            <div onClick={(e) => move(e, w, 4)} data-id={`one`} id={`one${w}`} className={`${styles.nut} one`}> </div>

        </div>
    )
}

export { Unit }
