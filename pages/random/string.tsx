import React, { FC, useEffect } from "react"
import Image from "next/image";


const Body: FC = () => {


    const randomFunc: any = {
        lower: getRandomLower,
        upper: getRandomUpper,
        number: getRandomNumber,
        symbol: getRandomSymbol,
    };

    function getRandomLower() {
        return String.fromCharCode(Math.floor(Math.random() * 26) + 97);
    }

    function getRandomUpper() {
        return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    }

    function getRandomNumber() {
        return String.fromCharCode(Math.floor(Math.random() * 10) + 48);
    }

    function getRandomSymbol() {
        const symbols = "!@#$%^&*(){}[]=<>/";
        return symbols[Math.floor(Math.random() * symbols.length)];
    }

    // ===========================================================================1

    let resultEl: any
    let lengthEl: any
    let uppercaseEl: any
    let lowercaseEl: any
    let numbersEl: any
    let symbolsEl: any
    let generateEl: any
    let clipboardEl: any

    useEffect(() => {

        resultEl = document.getElementById("result");
        lengthEl = document.getElementById("length");
        uppercaseEl = document.getElementById("uppercase");
        lowercaseEl = document.getElementById("lowercase");
        numbersEl = document.getElementById("numbers");
        symbolsEl = document.getElementById("symbols");
        generateEl = document.getElementById("generate");
        clipboardEl = document.getElementById("clipboard");


        clipboardEl.addEventListener("click", () => {
            debugger
            const textarea = document.createElement("textarea");
            const password = resultEl.innerText;

            if (!password) {
                return;
            }
            textarea.value = password;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            textarea.remove();
            alert("Password copied to clipboard!");
        });


        generateEl.addEventListener("click", () => {
            const length = +lengthEl.value;
            const hasLower = lowercaseEl.checked;
            const hasUpper = uppercaseEl.checked;
            const hasNumber = numbersEl.checked;
            const hasSymbol = symbolsEl.checked;

            resultEl.innerText = generatePassword(
                hasLower,
                hasUpper,
                hasNumber,
                hasSymbol,
                length
            );
        });


    }, [])

    function generatePassword(lower, upper, number, symbol, length) {
        debugger
        let generatedPassword = "";
        const typesCount = lower + upper + number + symbol;
        const typesArr = [{ lower }, { upper }, { number }, { symbol }].filter(
            (item) => Object.values(item)[0]
        );

        if (typesCount === 0) {
            return "";
        }

        for (let i = 0; i < length; i += typesCount) {
            typesArr.forEach((type) => {
                const funcName = Object.keys(type)[0];
                generatedPassword += randomFunc[funcName]();
            });
        }

        const finalPassword = generatedPassword.slice(0, length);
        return finalPassword;
    }



    return (
        <div className="main-rs-first">
            <Image
            src="/static/images/images (4).jfif"
            layout="fill"
            objectFit="fill"
            quality={100}
            className="imageBackground"
        />

            <div className="main-rs-container">
                <h2 className="test">Password generator</h2>
                <div className="result-container">
                    <span id="result"></span>
                    <button className="btn" id="clipboard" >
                        <i className="far fa-clipboard"></i>
                    </button>
                </div>
                <div className="settings">
                    <div className="setting">
                        <label>Password Length</label>
                        <input type="number" id="length" min="4" max="20" value="20" />
                    </div>
                    <div className="setting">
                        <label>Include uppercase letters</label>
                        <input type="checkbox" id="uppercase" checked />
                    </div>
                    <div className="setting">
                        <label>Include lowercase letters</label>
                        <input type="checkbox" id="lowercase" checked />
                    </div>
                    <div className="setting">
                        <label>Include numbers</label>
                        <input type="checkbox" id="numbers" checked />
                    </div>
                    <div className="setting">
                        <label>Include symbols</label>
                        <input type="checkbox" id="symbols" checked />
                    </div>
                </div>
                <button className="btn btn-large" id="generate">Generate Password</button>


            </div>

        </div>
    )
}


export default Body