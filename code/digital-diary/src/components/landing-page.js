import React from "react";
import { useState } from "react";
import '../styles/landing-page.css'

export const Landing = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function login(){
           
    }

    function register(){

    }

    return(
        <>
            <div className="background">
                <div className="book">
                    <div id="binder">
                    </div>
                    <div id="page">
                        <div id="user-details">
                            <div id="tag">
                                    <input 
                                        type="text"
                                        id="landing-fields"
                                        placeholder="Username..."
                                        onChange={(e) => {
                                            setUsername(e.target.value)
                                        }}
                                    ></input>                       
                                    <input 
                                        type="password"
                                        id="landing-fields"
                                        placeholder="Password..."
                                    ></input>

                            </div>
                        </div>
                        <div id="landing-buttons">
                            <button 
                                className="landing-button"
                                onClick={() => {
                                    login();
                                }}
                            >Login</button>
                            <button 
                                className="landing-button"
                                onClick={() => {
                                    register();
                                }}
                            >Register</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}